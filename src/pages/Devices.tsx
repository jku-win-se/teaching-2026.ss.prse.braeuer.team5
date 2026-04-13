import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { type Device, type DeviceType } from "../types";
import { useDevices } from "../hooks/useDevices";
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
  const { id: roomId } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const roomName = state?.roomName ?? "Raum";

  const { devices, loading, addDevice, removeDevice, renameDevice, toggleDevice, changeDeviceState } = useDevices(roomId);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [addingType, setAddingType] = useState<DeviceType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddDevice = async (deviceName: string, energyConsumption: number | null) => {
    if (!addingType) return;
    await addDevice(deviceName, addingType, energyConsumption);
    setAddingType(null);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    const success = await removeDevice(deviceToDelete.id);
    if (success) setDeviceToDelete(null);
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
              <h2>Devices</h2>
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
                  onToggle={toggleDevice}
                  onDelete={() => setDeviceToDelete(device)}
                  onUpdate={renameDevice}
                  onStateChange={changeDeviceState}
                />
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