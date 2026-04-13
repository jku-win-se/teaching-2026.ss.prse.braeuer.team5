import { useState } from "react";
import { Edit2, Trash2, Check, X, Sun, Thermometer, Layers, Activity } from "lucide-react";
import { type Device, type DeviceState } from "../types";
import { ToggleSwitch } from "./ToggleSwitch";
import "./DeviceCard.css";

type DeviceCardProps = {
  device: Device;
  onToggle: (deviceId: string, newState: boolean) => void;
  onDelete: (device: Device) => void;
  onUpdate: (deviceId: string, name: string) => void;
  onStateChange: (deviceId: string, newState: Partial<DeviceState>) => void;
  canManage: boolean;
};

export function DeviceCard({ device, onToggle, onDelete, onUpdate, onStateChange, canManage }: DeviceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const isOn = device.state?.on === true;

  const handleSave = () => {
    const trimmedName = editName.trim();
    if (trimmedName.length > 0) {
      onUpdate(device.id, trimmedName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(device.name);
    setIsEditing(false);
  };

  const renderSpecificControls = () => {
    if (!isOn) return null;

    switch (device.type) {
      case "Dimmer":
        return (
          <div className="custom-control">
            <Sun size={14} className="control-icon" />
            <input
              type="range"
              min="0"
              max="100"
              value={device.state?.brightness ?? 0}
              style={{ "--val": device.state?.brightness ?? 0 } as React.CSSProperties}
              onChange={(e) => onStateChange(device.id, { brightness: parseInt(e.target.value, 10) })}
            />
            <span className="control-value">{device.state?.brightness ?? 0}%</span>
          </div>
        );
      case "Thermostat": {
        const temp = device.state?.temperature ?? 21;
        return (
          <div className="custom-control">
            <Thermometer size={14} className="control-icon" />
            <div className="temp-control">
              <button
                className="temp-btn"
                onClick={() => onStateChange(device.id, { temperature: Math.max(5, temp - 0.5) })}
              >
                -
              </button>
              <span className="temp-display">{temp.toFixed(1)} C</span>
              <button
                className="temp-btn"
                onClick={() => onStateChange(device.id, { temperature: Math.min(35, temp + 0.5) })}
              >
                +
              </button>
            </div>
          </div>
        );
      }
      case "Jalousie":
        return (
          <div className="custom-control">
            <Layers size={14} />
            <button
              className={`blind-btn ${device.state?.position === "offen" ? "active" : ""}`}
              onClick={() => onStateChange(device.id, { position: "offen" })}
            >
              Auf
            </button>
            <button
              className={`blind-btn ${device.state?.position === "geschlossen" ? "active" : ""}`}
              onClick={() => onStateChange(device.id, { position: "geschlossen" })}
            >
              Zu
            </button>
          </div>
        );
      case "Sensor":
        return (
          <div className="custom-control">
            <Activity size={14} />
            <input
              type="text"
              className="sensor-input"
              value={String(device.state?.value ?? "")}
              onChange={(e) => onStateChange(device.id, { value: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const showStatusAndToggle = device.type === "Schalter" || device.type === "Jalousie" || device.type === "Sensor" || device.type === "Thermostat";
  const cardClassname = isEditing ? "device-card editing" : "device-card";

  return (
    <div className={cardClassname}>
      <div className="device-card-header">
        {isEditing ? (
          <div className="edit-input-group">
            <input
              className="device-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
            <div className="device-actions">
              <button className="action-btn save-btn" onClick={handleSave} title="Speichern" aria-label="Save device name">
                <Check size={20} />
              </button>
              <button className="action-btn cancel-btn" onClick={handleCancel} title="Abbrechen" aria-label="Cancel editing">
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <h3 className="device-name">{device.name}</h3>
        )}

        {!isEditing && canManage ? (
          <div className="device-actions">
            <button className="action-btn edit-btn" onClick={() => setIsEditing(true)} title="Bearbeiten" aria-label={`Edit ${device.name}`}>
              <Edit2 size={16} />
            </button>
            <button className="action-btn delete-btn" onClick={() => onDelete(device)} title="Loeschen" aria-label={`Delete ${device.name}`}>
              <Trash2 size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="device-info">
        <span className="badge type-badge">{device.type}</span>
        <span className="badge energy-badge">
          {device.energy_consumption != null ? `${device.energy_consumption} W` : "0 W"}
        </span>
      </div>

      <div className="device-footer" onClick={(e) => e.stopPropagation()}>
        {showStatusAndToggle ? (
          <div className="status-row">
            <span className={isOn ? "status-text text-on" : "status-text text-off"}>
              {isOn ? "Eingeschaltet" : "Ausgeschaltet"}
            </span>
            <ToggleSwitch isOn={isOn} onChange={(val) => onToggle(device.id, val)} />
          </div>
        ) : null}

        <div className="specific-controls-container">{renderSpecificControls()}</div>
      </div>
    </div>
  );
}
