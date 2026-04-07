import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { type Device, type DeviceType } from "../types";
import { fetchDevices, addDeviceToRoom, deleteDevice } from "../services/deviceService";
import { DeviceTypeSidebar } from "../components/DeviceTypeSidebar";
import { AddModalDevice } from "../components/modals/AddModalDevice";
import { DeleteModal } from "../components/modals/DeleteModal";
import "./Devices.css";

type LocationState = {
  roomName?: string;
};

export default function Devices() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const roomName = state?.roomName ?? "Raum";

  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [addingType, setAddingType] = useState<DeviceType | null>(null);

  useEffect(() => {
    loadDevices();
  }, [roomId]);

  const loadDevices = async () => {
    if (!roomId) return;
    setLoading(true);
    const loadedDevices = await fetchDevices(roomId);
    setDevices(loadedDevices);
    setLoading(false);
  };

  const handleAddDevice = async (deviceName: string, energyConsumption: number | null) => {
    if (!addingType || !roomId) return;

    const newDevice = await addDeviceToRoom(roomId, deviceName, addingType, energyConsumption);

    if (newDevice) {
      setDevices((current) => [...current, newDevice]);
      setAddingType(null);
    }
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    const success = await deleteDevice(deviceToDelete.id);
    if (success) {
      setDevices((current) => current.filter((d) => d.id !== deviceToDelete.id));
      setDeviceToDelete(null);
    }
  };

  return (
    <section className="rooms-container">
      <div className="devices-layout">
        
        {/* Hier wird die neue Komponente genutzt */}
        <DeviceTypeSidebar onSelectType={setAddingType} />

        <div className="devices-main">
          <div className="rooms-header">
            <div>
              <h2>Geräte für Raum</h2>
              <p>{roomName}</p>
            </div>
            <button className="add-button" onClick={() => navigate("/rooms")}>
              Zurück
            </button>
          </div>

          <div className="room-list">
            {loading ? (
              <p>Laden...</p>
            ) : devices.length === 0 ? (
              <p>Es sind noch keine Geräte im Raum angelegt. Wähle links ein Bauteil aus.</p>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="room-card">
                  <div>
                    <strong>{device.name}</strong>
                    <span className="device-type-badge">{device.type}</span>
                    {device.energy_consumption && (
                      <span className="device-energy"> {device.energy_consumption}W</span>
                    )}
                  </div>
                  <div className="actions">
                    <button onClick={() => setDeviceToDelete(device)}>
                      <div style={{ color: "red" }}><Trash2 size={16} /></div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <AddModalDevice
        deviceType={addingType}
        isOpen={addingType !== null}
        onClose={() => setAddingType(null)}
        onSave={handleAddDevice}
      />

      <DeleteModal
        itemName={deviceToDelete?.name || null}
        itemType="Gerät"
        isOpen={deviceToDelete !== null}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleDeleteDevice}
      />
    </section>
  );
}