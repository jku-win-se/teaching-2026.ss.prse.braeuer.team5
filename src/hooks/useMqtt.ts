import { useState, useEffect } from "react";
import { mqttService, type MqttConfig, type MqttConnectionStatus } from "../services/mqttService";

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

  function saveAndConnect(configToUse: MqttConfig) {
    setConfig(configToUse);
    mqttService.saveConfig(configToUse);
    mqttService.connect(configToUse);
  }

  function disconnect() {
    mqttService.disconnect();
  }

  return { config, status, lastError, saveAndConnect, disconnect };
}
