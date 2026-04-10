import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { type Device } from "../types";
import { ToggleSwitch } from "./ToggleSwitch";
import "./DeviceCard.css";

type DeviceCardProps = {
  device: Device;
  onToggle: (deviceId: string, newState: boolean) => void;
  onDelete: (device: Device) => void;
  onUpdate: (deviceId: string, name: string) => void;
};

export function DeviceCard({ device, onToggle, onDelete, onUpdate }: DeviceCardProps) {
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
        <span className="device-badge type-badge">{device.type}</span>
        <span className="device-badge energy-badge">
          {device.energy_consumption != null ? `${device.energy_consumption} W` : "0 W"}
        </span>
      </div>

      {/* Card Footer: Toggle Switch & Status */}
      <div className="device-controls">
        <span className={statusClassName}>
          {statusText}
        </span>
        <ToggleSwitch
          isOn={isOn}
          onChange={(newState) => onToggle(device.id, newState)}
          ariaLabel={`Toggle ${device.name}`}
        />
      </div>
    </div>
  );
}

