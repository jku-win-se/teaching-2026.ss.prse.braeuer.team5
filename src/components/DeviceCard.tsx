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
};

export function DeviceCard({ device, onToggle, onDelete, onUpdate, onStateChange }: DeviceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const isOn = device.state?.on === true;

  // Handle save button click
  const handleSave = () => {
    const trimmedName = editName.trim();
    const isNameValid = trimmedName.length > 0;
    
    if (isNameValid) {
      onUpdate(device.id, trimmedName);
      setIsEditing(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditName(device.name);
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };

  //FR-06
  const renderSpecificControls = () => {
    if (!isOn && device.type !== "Sensor") return null;

    switch (device.type) {
      case "Dimmer":
        return (
          <div className="custom-control">
            <Sun size={14} />
            <input
              type="range"
              min="0"
              max="100"
              value={device.state?.brightness ?? 0}
              onChange={(e) => onStateChange(device.id, { brightness: parseInt(e.target.value, 10) })}
            />
            <span className="control-value">{device.state?.brightness ?? 0}%</span>
          </div>
        );

      case "Thermostat":
        return (
          <div className="custom-control">
            <Thermometer size={14} />
            <input
              type="number"
              step="0.5"
              className="temp-input"
              value={device.state?.temperature ?? 21}
              onChange={(e) => onStateChange(device.id, { temperature: parseFloat(e.target.value) })}
            />
            <span className="unit">°C</span>
          </div>
        );

      case "Jalousie":
        return (
          <div className="custom-control">
            <Layers size={14} />
            <button 
              className={`blind-btn ${device.state?.position === 'offen' ? 'active' : ''}`}
              onClick={() => onStateChange(device.id, { position: 'offen' })}
            >Auf</button>
            <button 
              className={`blind-btn ${device.state?.position === 'geschlossen' ? 'active' : ''}`}
              onClick={() => onStateChange(device.id, { position: 'geschlossen' })}
            >Zu</button>
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

  // Determine CSS class based on editing state
  const cardClassname = isEditing ? "device-card editing" : "device-card";

  // Determine status text based on device state
  const statusText = isOn ? "Eingeschaltet" : "Ausgeschaltet";
  const statusClassName = isOn ? "status-text text-on" : "status-text text-off";

  return (
    <div className={cardClassname}>
      {/* Card Header: Name & Actions */}
      <div className="device-card-header">
        {isEditing ? (
          // Edit Mode: Show input field with save/cancel buttons
          <div className="edit-input-group">
            <input
              className="device-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
            <div className="device-actions">
              <button
                className="action-btn save-btn"
                onClick={handleSave}
                title="Speichern"
                aria-label="Save device name"
              >
                <Check size={20} />
              </button>
              <button
                className="action-btn cancel-btn"
                onClick={handleCancel}
                title="Abbrechen"
                aria-label="Cancel editing"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          // View Mode: Show device name
          <h3 className="device-name">{device.name}</h3>
        )}
        
        {!isEditing && (
          // Show edit/delete buttons only when not editing
          <div className="device-actions">
            <button
              className="action-btn edit-btn"
              onClick={handleEdit}
              title="Bearbeiten"
              aria-label={`Edit ${device.name}`}
            >
              <Edit2 size={16} />
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(device)}
              title="Löschen"
              aria-label={`Delete ${device.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Card Body: Info Badges */}
      <div className="device-info">
        <span className="badge type-badge">{device.type}</span>
        <span className="badge energy-badge">
          {device.energy_consumption != null ? `${device.energy_consumption} W` : "0 W"}
        </span>
      </div>

      {/* Footer*/}
      <div className="device-footer">
        <div className="status-row">
          <span className={statusClassName}>{statusText}</span>
          <ToggleSwitch 
            isOn={isOn} 
            onChange={(newState) => onToggle(device.id, newState)} 
          />
        </div>
        
        <div className="specific-controls-container">
          {renderSpecificControls()}
        </div>
      </div>
    </div>
  );
}
