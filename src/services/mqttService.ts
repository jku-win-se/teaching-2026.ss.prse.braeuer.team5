import mqtt, { type MqttClient } from "mqtt";
import { updateDeviceState } from "./deviceService";
import type { DeviceState } from "../types";

/** Verbindungsstatus des MQTT-Clients. */
export type MqttConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

/**
 * Konfiguration für die MQTT-Broker-Verbindung.
 * Wird in `localStorage` unter dem Schlüssel `mqtt_config` persistiert.
 */
export interface MqttConfig {
  /** WebSocket-URL des Brokers (z. B. `"ws://localhost"`). */
  brokerUrl: string;
  /** WebSocket-Port des Brokers (Standard: 9001). */
  port: number;
  /** Eindeutige Client-ID für die MQTT-Session. */
  clientId: string;
  /** Benutzername für die Broker-Authentifizierung (leer = anonym). */
  username: string;
  /** Passwort für die Broker-Authentifizierung (leer = anonym). */
  password: string;
  /** Topic-Präfix für alle Geräte-Topics (z. B. `"smarthome"`). */
  topicPrefix: string;
}

/** Standardkonfiguration, die verwendet wird wenn kein gespeicherter Wert vorliegt. */
export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  brokerUrl: "ws://localhost",
  port: 9001,
  clientId: `smarthome-${Math.random().toString(16).slice(2, 8)}`,
  username: "",
  password: "",
  topicPrefix: "smarthome",
};

const STORAGE_KEY = "mqtt_config";

/**
 * Verwaltet die MQTT-Broker-Verbindung und leitet eingehende Nachrichten
 * an {@link updateDeviceState} weiter.
 *
 * Topic-Konventionen:
 * - Eingehend (Gerätestatus): `<prefix>/devices/<device_id>/state`
 * - Ausgehend (Befehl senden): `<prefix>/devices/<device_id>/set`
 *
 * Die Singleton-Instanz wird als {@link mqttService} exportiert.
 */
class MqttService {
  private client: MqttClient | null = null;
  private statusListeners = new Set<(status: MqttConnectionStatus) => void>();
  private _status: MqttConnectionStatus = "disconnected";
  private _lastError: string | null = null;
  private _currentConfig: MqttConfig | null = null;

  /** Aktueller Verbindungsstatus. */
  get status(): MqttConnectionStatus { return this._status; }

  /** Letzte Fehlermeldung oder `null` wenn kein Fehler vorliegt. */
  get lastError(): string | null { return this._lastError; }

  /**
   * Lädt die MQTT-Konfiguration aus `localStorage`.
   * Fällt auf {@link DEFAULT_MQTT_CONFIG} zurück wenn kein Wert gespeichert ist.
   * @returns Aktuelle oder Standard-Konfiguration.
   */
  loadConfig(): MqttConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_MQTT_CONFIG, ...JSON.parse(stored) };
    } catch {
      // corrupt storage — fall through to default
    }
    return { ...DEFAULT_MQTT_CONFIG };
  }

  /**
   * Speichert die MQTT-Konfiguration in `localStorage`.
   * @param config - Zu speichernde Konfiguration.
   */
  saveConfig(config: MqttConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  /**
   * Registriert einen Listener für Statusänderungen der MQTT-Verbindung.
   * @param listener - Callback der bei jeder Statusänderung aufgerufen wird.
   * @returns Funktion zum Abmelden des Listeners (für `useEffect`-Cleanup).
   */
  onStatusChange(listener: (status: MqttConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => { this.statusListeners.delete(listener); };
  }

  private setStatus(status: MqttConnectionStatus, error?: string) {
    this._status = status;
    this._lastError = error ?? null;
    this.statusListeners.forEach(l => l(status));
  }

  /**
   * Stellt eine MQTT-Verbindung her und abonniert automatisch den Topic
   * `<prefix>/devices/+/state` für eingehende Statusmeldungen.
   * Eine bestehende Verbindung wird zuvor getrennt.
   * @param config - Broker-Konfiguration.
   */
  connect(config: MqttConfig): void {
    if (this.client) this.disconnect();

    this._currentConfig = config;
    this.setStatus("connecting");

    const url = `${config.brokerUrl}:${config.port}`;

    this.client = mqtt.connect(url, {
      clientId: config.clientId,
      username: config.username || undefined,
      password: config.password || undefined,
      reconnectPeriod: 0,
    });

    this.client.on("connect", () => {
      this.setStatus("connected");
      const topic = `${config.topicPrefix}/devices/+/state`;
      this.client?.subscribe(topic, (err) => {
        if (err) console.error("[MQTT] Subscribe error:", err);
      });
    });

    this.client.on("error", (err) => {
      this.setStatus("error", err.message);
    });

    this.client.on("close", () => {
      if (this._status !== "error") this.setStatus("disconnected");
    });

    this.client.on("message", (topic, payload) => {
      void this.handleMessage(topic, payload.toString());
    });
  }

  /**
   * Trennt die MQTT-Verbindung und setzt den Status auf `disconnected`.
   */
  disconnect(): void {
    this.client?.end(true);
    this.client = null;
    this._currentConfig = null;
    this.setStatus("disconnected");
  }

  /**
   * Sendet einen Gerätezustand als MQTT-Befehl an das physische Gerät.
   * Topic: `<prefix>/devices/<deviceId>/set` (QoS 1).
   * Wird ignoriert wenn keine aktive Verbindung besteht.
   * @param deviceId - UUID des Ziel-Geräts.
   * @param state - Neuer Gerätezustand (wird als JSON serialisiert).
   */
  publishDeviceState(deviceId: string, state: DeviceState): void {
    if (!this.client || this._status !== "connected" || !this._currentConfig) return;
    const topic = `${this._currentConfig.topicPrefix}/devices/${deviceId}/set`;
    this.client.publish(topic, JSON.stringify(state), { qos: 1 });
  }

  private async handleMessage(topic: string, payload: string) {
    if (!this._currentConfig) return;

    // expected topic: <prefix>/devices/<device_id>/state
    const prefix = this._currentConfig.topicPrefix;
    const deviceSegment = `${prefix}/devices/`;
    if (!topic.startsWith(deviceSegment) || !topic.endsWith("/state")) return;

    const deviceId = topic.slice(deviceSegment.length, -"/state".length);
    if (!deviceId || deviceId.includes("/")) return;

    try {
      const state = JSON.parse(payload) as DeviceState;
      await updateDeviceState(deviceId, state);
    } catch {
      console.warn("[MQTT] Invalid payload on", topic, ":", payload);
    }
  }
}

/** Singleton-Instanz des {@link MqttService}. */
export const mqttService = new MqttService();
