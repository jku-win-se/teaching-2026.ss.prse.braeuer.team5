import { useState } from "react";
import { X } from "lucide-react";
import { type DeviceType } from "../../types";
import "./AddModalDevice.css";

type AddModalDeviceProps = {
  deviceType: DeviceType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceName: string, energyConsumption: number | null) => void;
};

export function AddModalDevice({ deviceType, isOpen, onClose, onSave }: AddModalDeviceProps) {
  const [deviceName, setDeviceName] = useState("");
  const [energyConsumption, setEnergyConsumption] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !deviceType) return null;

  const handleSave = () => {
    if (!deviceName.trim()) {
      setError("Der Gerätename ist Pflicht.");
      return;
    }

    const energyValue = energyConsumption.trim() ? parseInt(energyConsumption, 10) : null;
    onSave(deviceName.trim(), energyValue);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDeviceName("");
    setEnergyConsumption("");
    setError("");
  };

  return (
    <div className="modal-overlay-device">
      <div className="modal-device">
        <div className="modal-header-device">
          <h3>Neues Gerät: {deviceType}</h3>
          <button className="icon-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-content-device">
          <label>
            Gerätename
            <input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="z.B. Deckenlampe..."
              autoFocus
            />
          </label>
          <label>
            Stromverbrauch in Watt (optional)
            <input
              type="number"
              value={energyConsumption}
              onChange={(e) => setEnergyConsumption(e.target.value)}
              placeholder="z.B. 60"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="modal-actions-device">
          <button onClick={handleClose}>Abbrechen</button>
          <button className="primary" onClick={handleSave}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
