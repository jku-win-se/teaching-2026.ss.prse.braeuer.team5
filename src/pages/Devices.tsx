import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { type Device, type DeviceType } from "../types";
import { useDevices } from "../hooks/useDevices";
import { useRoomRole } from "../hooks/useRoomRole";
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
  const { canManage, loading: roleLoading } = useRoomRole(roomId);

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
        <DeviceTypeSidebar
          onSelectType={setAddingType}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          canManage={canManage}
        />

        <div className="devices-main">
          <div className="devices-header">
            <div>
              <h2>Devices</h2>
              <p>{roomName}</p>
              {!roleLoading && !canManage ? (
                <p className="device-role-hint">Als Mitglied kannst du Geraete steuern, aber nicht verwalten.</p>
              ) : null}
            </div>

            <div className="mobile-sidebar-toggle">
              <button onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
            </div>

            <button className="add-button" onClick={() => navigate("/rooms")}>
              Zurueck
            </button>
          </div>

          <div className="devices-grid">
            {loading ? (
              <p>Laden...</p>
            ) : devices.length === 0 ? (
              <p>{canManage ? "Es sind noch keine Geraete im Raum angelegt. Waehle links ein Bauteil aus." : "Es sind noch keine Geraete im Raum angelegt."}</p>
            ) : (
              devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggle={toggleDevice}
                  onDelete={() => setDeviceToDelete(device)}
                  onUpdate={renameDevice}
                  onStateChange={changeDeviceState}
                  canManage={canManage}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AddModalDevice
        deviceType={addingType}
        isOpen={addingType !== null && canManage}
        onClose={() => setAddingType(null)}
        onSave={handleAddDevice}
      />

      <DeleteModal
        itemName={deviceToDelete?.name || null}
        itemType="Geraet"
        isOpen={deviceToDelete !== null}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleDeleteDevice}
      />
    </section>
  );
}
