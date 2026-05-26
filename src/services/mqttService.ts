import mqtt, { type MqttClient } from "mqtt";
import { updateDeviceState } from "./deviceService";
import type { DeviceState } from "../types";

export type MqttConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface MqttConfig {
  brokerUrl: string;
  port: number;
  clientId: string;
  username: string;
  password: string;
  topicPrefix: string;
}

export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  brokerUrl: "ws://localhost",
  port: 9001,
  clientId: `smarthome-${Math.random().toString(16).slice(2, 8)}`,
  username: "",
  password: "",
  topicPrefix: "smarthome",
};

const STORAGE_KEY = "mqtt_config";

class MqttService {
  private client: MqttClient | null = null;
  private statusListeners = new Set<(status: MqttConnectionStatus) => void>();
  private _status: MqttConnectionStatus = "disconnected";
  private _lastError: string | null = null;
  private _currentConfig: MqttConfig | null = null;

  get status(): MqttConnectionStatus { return this._status; }
  get lastError(): string | null { return this._lastError; }

  loadConfig(): MqttConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_MQTT_CONFIG, ...JSON.parse(stored) };
    } catch {
      // corrupt storage — fall through to default
    }
    return { ...DEFAULT_MQTT_CONFIG };
  }

  saveConfig(config: MqttConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  onStatusChange(listener: (status: MqttConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => { this.statusListeners.delete(listener); };
  }

  private setStatus(status: MqttConnectionStatus, error?: string) {
    this._status = status;
    this._lastError = error ?? null;
    this.statusListeners.forEach(l => l(status));
  }

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

  disconnect(): void {
    this.client?.end(true);
    this.client = null;
    this._currentConfig = null;
    this.setStatus("disconnected");
  }

  // Publish device state command to a real device
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

export const mqttService = new MqttService();
