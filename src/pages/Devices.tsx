import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { type Device, type DeviceType, type RoomMember } from "../types";
import { useDevices } from "../hooks/useDevices";
import { useRoomRole } from "../hooks/useRoomRole";
import { DeviceTypeSidebar } from "../components/DeviceTypeSidebar";
import { DeviceCard } from "../components/DeviceCard";
import { AddModalDevice } from "../components/modals/AddModalDevice";
import { DeleteModal } from "../components/modals/DeleteModal";
import { Menu } from "lucide-react";
import { createRoomInvite, fetchRoomMembers, removeRoomMember } from "../services/inviteService";
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
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!roomId || !canManage) {
      setMembers([]);
      return;
    }

    try {
      const nextMembers = await fetchRoomMembers(roomId);
      setMembers(nextMembers);
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Mitglieder konnten nicht geladen werden.");
    }
  }, [roomId, canManage]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

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

  const handleInviteMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomId || !memberEmail.trim()) return;

    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await createRoomInvite(roomId, memberEmail.trim());
      setMemberMessage(`Einladung fuer ${memberEmail.trim()} wurde erstellt.`);
      setMemberEmail("");
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Einladung konnte nicht erstellt werden.");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, email: string) => {
    if (!roomId) return;

    setMemberLoading(true);
    setMemberError("");
    setMemberMessage("");

    try {
      await removeRoomMember(roomId, memberUserId);
      setMemberMessage(`${email} wurde aus dem Raum entfernt.`);
      await loadMembers();
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : "Mitglied konnte nicht entfernt werden.");
    } finally {
      setMemberLoading(false);
    }
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

          {canManage ? (
            <section className="members-section">
              <div className="members-section-header">
                <div>
                  <h3>Mitglieder</h3>
                  <p>Hier kannst du Mitglieder einladen und bestehende Zugriffe entfernen.</p>
                </div>
              </div>

              <form className="member-invite-form" onSubmit={handleInviteMember}>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="E-Mail zum Einladen"
                  required
                />
                <button type="submit" disabled={memberLoading || !memberEmail.trim()}>
                  {memberLoading ? "..." : "+"}
                </button>
              </form>

              {memberError ? <p className="members-error">{memberError}</p> : null}
              {memberMessage ? <p className="members-success">{memberMessage}</p> : null}

              <div className="member-list">
                {members.map((member) => (
                  <article key={member.user_id} className="member-card">
                    <div>
                      <p className="member-email">{member.email}</p>
                      <p className="member-role">{member.role}</p>
                    </div>
                    <button
                      type="button"
                      className="member-remove-button"
                      onClick={() => handleRemoveMember(member.user_id, member.email)}
                    >
                      Entfernen
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
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
