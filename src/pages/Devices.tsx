import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { type Device, type DeviceType, type DeviceState } from "../types";
import { fetchDevices, addDeviceToRoom, deleteDevice, updateDeviceName, updateDeviceState } from "../services/deviceService";
import { DeviceTypeSidebar } from "../components/DeviceTypeSidebar";
import { DeviceCard } from "../components/DeviceCard";
import { AddModalDevice } from "../components/modals/AddModalDevice";
import { DeleteModal } from "../components/modals/DeleteModal";
import { Menu } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleUpdateDevice = async (deviceId: string, newName: string) => {
    const success = await updateDeviceName(deviceId, newName);

    if (success) {
      setDevices((current) =>
        current.map((device) =>
          device.id === deviceId ? { ...device, name: newName } : device
        )
      );
    }
  };

 const handleToggle = async (deviceId: string, newState: boolean) => {
    //UI Update
    setDevices((currentDevices) => {
      return currentDevices.map((device) =>
        device.id === deviceId
          ? { ...device, state: { ...device.state, on: newState } }
          : device
      );
    });

    //DB Update
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      const updatedFullState: DeviceState = { ...device.state, on: newState };
      await updateDeviceState(deviceId, updatedFullState);
    }
  };

  //FR-06
  const handleStateChange = async (deviceId: string, newState: Partial<DeviceState>) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const updatedFullState = { ...device.state, ...newState };

    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, state: updatedFullState } : d
    ));

    await updateDeviceState(deviceId, updatedFullState);
  };

  return (
    <section className="devices-container">
      <div className="devices-layout">
        {/* Sidebar bekommt jetzt Props für den State */}
        <DeviceTypeSidebar 
          onSelectType={setAddingType} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <div className="devices-main">
          <div className="devices-header">
            <div>
              <h2>Geräte für Raum</h2>
              <p>{roomName}</p>
            </div>
            
            <div className="mobile-sidebar-toggle" >
              {/* BURGER MENU BUTTON: Nur auf Mobile sichtbar über CSS */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>

            <button className="add-button" onClick={() => navigate("/rooms")}>
              Zurück
            </button>
          </div>

            <div className="mobile-sidebar-toggle" >
              {/* BURGER MENU BUTTON: Nur auf Mobile sichtbar über CSS */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>

            <button className="add-button" onClick={() => navigate("/rooms")}>Zurück</button>
          </div>
          <div className="devices-grid">
            {loading ? (
              <p>Laden...</p>
            ) : devices.length === 0 ? (
              <p>Es sind noch keine Geräte im Raum angelegt. Wähle links ein Bauteil aus.</p>
            ) : (
              devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggle={handleToggle}
                  onDelete={() => setDeviceToDelete(device)}
                  onUpdate={handleUpdateDevice}
                  onStateChange={handleStateChange}
                />
              ))
            )}
          </div>
        </div>
      </div>

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