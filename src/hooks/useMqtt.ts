import { useState, useEffect } from "react";
import { mqttService, type MqttConfig, type MqttConnectionStatus } from "../services/mqttService";

/**
 * React-Hook zur Verwaltung der MQTT-Verbindung.
 *
 * Abonniert Statusänderungen des {@link mqttService}-Singletons und
 * stellt Funktionen zum Verbinden und Trennen bereit.
 * Die Statussubscription wird beim Unmount automatisch bereinigt.
 *
 * @returns
 * - `config` – Aktuelle {@link MqttConfig} (aus `localStorage` geladen)
 * - `status` – Aktueller {@link MqttConnectionStatus}
 * - `lastError` – Letzte Fehlermeldung oder `null`
 * - `saveAndConnect` – Speichert die Konfiguration und stellt eine Verbindung her
 * - `disconnect` – Trennt die aktive MQTT-Verbindung
 */
export function useMqtt() {
  const [config, setConfig] = useState<MqttConfig>(() => mqttService.loadConfig());
  const [status, setStatus] = useState<MqttConnectionStatus>(mqttService.status);
  const [lastError, setLastError] = useState<string | null>(mqttService.lastError);

  useEffect(() => {
    return mqttService.onStatusChange((s) => {
      setStatus(s);
      setLastError(mqttService.lastError);
    });
  }, []);

  /**
   * Speichert die Konfiguration in `localStorage` und baut eine neue Verbindung auf.
   * @param configToUse - Neue Broker-Konfiguration.
   */
  function saveAndConnect(configToUse: MqttConfig) {
    setConfig(configToUse);
    mqttService.saveConfig(configToUse);
    mqttService.connect(configToUse);
  }

  /**
   * Trennt die aktive MQTT-Verbindung.
   */
  function disconnect() {
    mqttService.disconnect();
  }

  return { config, status, lastError, saveAndConnect, disconnect };
}
