import { useState } from "react";
import { useMqtt } from "../../hooks/useMqtt";
import type { MqttConfig } from "../../services/mqttService";
import "./MqttSettings.css";

const STATUS_LABEL: Record<string, string> = {
  disconnected: "Getrennt",
  connecting: "Verbinde...",
  connected: "Verbunden",
  error: "Fehler",
};

export function MqttSettings() {
  const { config, status, lastError, saveAndConnect, disconnect } = useMqtt();
  const [form, setForm] = useState<MqttConfig>(config);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  function update<K extends keyof MqttConfig>(field: K, value: MqttConfig[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="mqtt-container">
      <div className="mqtt-header">
        <h1>MQTT-Integration</h1>
        <span className={`mqtt-status-badge mqtt-status-${status}`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="mqtt-card">
        <h2 className="mqtt-section-title">Verbindung</h2>

        <div className="form-row-half">
          <div className="form-group">
            <label>Broker-URL</label>
            <input
              type="text"
              value={form.brokerUrl}
              placeholder="ws://broker.example.com"
              onChange={(e) => update("brokerUrl", e.target.value)}
              disabled={isConnected || isConnecting}
            />
          </div>
          <div className="form-group">
            <label>Port</label>
            <input
              type="number"
              value={form.port}
              onChange={(e) => update("port", Number(e.target.value))}
              disabled={isConnected || isConnecting}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Client-ID</label>
          <input
            type="text"
            value={form.clientId}
            onChange={(e) => update("clientId", e.target.value)}
            disabled={isConnected || isConnecting}
          />
        </div>

        <div className="form-row-half">
          <div className="form-group">
            <label>Username (optional)</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              disabled={isConnected || isConnecting}
            />
          </div>
          <div className="form-group">
            <label>Passwort (optional)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              disabled={isConnected || isConnecting}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Topic-Prefix</label>
          <input
            type="text"
            value={form.topicPrefix}
            onChange={(e) => update("topicPrefix", e.target.value)}
            disabled={isConnected || isConnecting}
          />
        </div>

        {lastError && (
          <div className="mqtt-error-notice">{lastError}</div>
        )}

        <div className="mqtt-actions">
          {isConnected ? (
            <button className="btn-danger" onClick={disconnect}>
              Trennen
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => saveAndConnect(form)}
              disabled={isConnecting || !form.brokerUrl}
            >
              {isConnecting ? "Verbinde..." : "Verbinden & Speichern"}
            </button>
          )}
        </div>
      </div>

      <div className="mqtt-card mqtt-info-card">
        <h2 className="mqtt-section-title">Topic-Konvention</h2>
        <p className="mqtt-info-text">
          Die App abonniert eingehende Gerätezustände und aktualisiert Supabase automatisch.
        </p>
        <div className="mqtt-topic-table">
          <div className="mqtt-topic-row">
            <span className="topic-direction">Eingehend</span>
            <code className="topic-pattern">{form.topicPrefix}/devices/&lt;device_id&gt;/state</code>
            <span className="topic-desc">Gerätestatus vom echten Gerät empfangen</span>
          </div>
          <div className="mqtt-topic-row">
            <span className="topic-direction">Ausgehend</span>
            <code className="topic-pattern">{form.topicPrefix}/devices/&lt;device_id&gt;/set</code>
            <span className="topic-desc">Befehl an echtes Gerät senden</span>
          </div>
        </div>
        <p className="mqtt-info-text mqtt-payload-hint">
          Payload: JSON-Objekt mit Gerätezustand, z.B. <code>{`{"on":true,"brightness":80}`}</code>
        </p>
      </div>
    </div>
  );
}
