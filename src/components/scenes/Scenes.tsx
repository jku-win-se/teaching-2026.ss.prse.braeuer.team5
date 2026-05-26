import React, { useState, useMemo } from "react";
import { useScenes, type SceneDevice } from "../../hooks/useScenes";
import { useRooms } from "../../hooks/useRooms";
import { sceneService } from "../../services/sceneService";
import { LucidePencil, LucideTrash2, LucidePlus, LucideX, LucidePlay } from "lucide-react";
import type { Scene, DeviceState, SceneDeviceEntry } from "../../types";
import { DeleteModal } from "../modals/DeleteModal";
import "./Scenes.css";

type ActionRow = { device_id: string; target_state: DeviceState };

function getDefaultState(type: string): DeviceState {
  const t = type.trim();
  if (t === "Dimmer") return { on: true, brightness: 80 };
  if (t === "Thermostat") return { on: true, temperature: 21 };
  if (t === "Jalousie") return { on: true, position: 0 };
  return { on: true };
}

interface StateControlProps {
  type: string;
  state: DeviceState;
  onChange: (s: DeviceState) => void;
}

const StateControl: React.FC<StateControlProps> = ({ type, state, onChange }) => {
  const t = type.trim();

  if (t === "Thermostat") {
    return (
      <div className="state-control state-control-composite">
        <select
          value={state.on !== false ? "true" : "false"}
          onChange={(e) => onChange({ ...state, on: e.target.value === "true" })}
        >
          <option value="true">An</option>
          <option value="false">Aus</option>
        </select>
        <div className="input-with-unit">
          <input
            type="number"
            step="0.5"
            value={state.temperature ?? 21}
            onChange={(e) => onChange({ ...state, temperature: parseFloat(e.target.value) })}
          />
          <span className="unit-label">°C</span>
        </div>
      </div>
    );
  }
  if (t === "Dimmer") {
    return (
      <div className="state-control state-control-composite">
        <select
          value={state.on !== false ? "true" : "false"}
          onChange={(e) => onChange({ ...state, on: e.target.value === "true" })}
        >
          <option value="true">An</option>
          <option value="false">Aus</option>
        </select>
        <div className="input-with-unit">
          <input
            type="number"
            min={0}
            max={100}
            value={state.brightness ?? 80}
            onChange={(e) => onChange({ ...state, brightness: parseInt(e.target.value) })}
          />
          <span className="unit-label">%</span>
        </div>
      </div>
    );
  }
  if (t === "Jalousie") {
    return (
      <div className="state-control state-control-composite">
        <select
          value={state.on !== false ? "true" : "false"}
          onChange={(e) => onChange({ ...state, on: e.target.value === "true" })}
        >
          <option value="true">An</option>
          <option value="false">Aus</option>
        </select>
        <select
          value={state.position ?? 0}
          onChange={(e) => onChange({ ...state, position: parseInt(e.target.value) })}
        >
          <option value={0}>Zu</option>
          <option value={100}>Auf</option>
        </select>
      </div>
    );
  }
  return (
    <div className="state-control">
      <select
        value={state.on !== false ? "true" : "false"}
        onChange={(e) => onChange({ on: e.target.value === "true" })}
      >
        <option value="true">An</option>
        <option value="false">Aus</option>
      </select>
    </div>
  );
};

const EMPTY_FORM = {
  name: "",
  room_ids: [] as string[],
  description: "",
  device_states: [] as ActionRow[],
};

interface SceneListProps {
  scenes: Scene[];
  canManage: (s: Scene) => boolean;
  activating: string | null;
  onActivate: (s: Scene) => void;
  onEdit: (s: Scene) => void;
  onDelete: (id: string) => void;
  getDeviceName: (id: string) => string;
}

const SceneList = React.memo(
  ({ scenes, canManage, activating, onActivate, onEdit, onDelete, getDeviceName }: SceneListProps) => (
    <div className="scenes-grid">
      {scenes.length === 0 && (
        <div className="empty-state">Noch keine Szenen angelegt.</div>
      )}
      {scenes.map((s) => {
        const sceneRooms = s.scene_rooms || [];
        return (
          <div key={s.id} className="scene-card">
            <div className="scene-info">
              <div className="scene-title-row">
                <span className="scene-name">{s.name}</span>
                <span className={`room-rule-badge ${canManage(s) ? "owner" : "member"}`}>
                  {canManage(s) ? "Eigentümer" : "Mitglied"}
                </span>
              </div>

              <div className="vacation-room-chips">
                {sceneRooms.map((sr) => (
                  <span key={sr.room_id} className="vacation-room-chip">
                    {sr.rooms?.name ?? sr.room_id}
                  </span>
                ))}
                {sceneRooms.length === 0 && (
                  <span className="vacation-room-chip vacation-room-chip--empty">Keine Räume</span>
                )}
              </div>

              {s.description && (
                <div className="scene-description">{s.description}</div>
              )}
              <div className="scene-devices-preview">
                {(s.device_states as SceneDeviceEntry[]).map((entry, i) => (
                  <span key={i} className="scene-device-chip">
                    {getDeviceName(entry.device_id)}
                  </span>
                ))}
                {s.device_states.length === 0 && (
                  <span className="scene-device-chip" style={{ opacity: 0.5 }}>
                    Keine Geräte
                  </span>
                )}
              </div>
            </div>

            <div className="scene-actions">
              <button
                className="activate-btn"
                onClick={() => onActivate(s)}
                disabled={activating === s.id || s.device_states.length === 0}
                title="Szene aktivieren"
              >
                <LucidePlay size={15} />
                {activating === s.id ? "..." : "Aktivieren"}
              </button>

              {canManage(s) && (
                <>
                  <button className="action-btn edit-btn" onClick={() => onEdit(s)}>
                    <LucidePencil size={18} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => onDelete(s.id)}>
                    <LucideTrash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )
);

export const Scenes: React.FC = () => {
  const { scenes, devices, loading, refresh } = useScenes();
  const { rooms } = useRooms();

  const ownerRoomIds = useMemo(
    () => new Set(rooms.filter((r) => r.role === "owner").map((r) => r.id)),
    [rooms]
  );
  const ownerRooms = useMemo(
    () => rooms.filter((r) => r.role === "owner"),
    [rooms]
  );

  const canManageScene = (s: Scene) => {
    const sceneRooms = s.scene_rooms || [];
    if (sceneRooms.length === 0) return ownerRoomIds.size > 0;
    return sceneRooms.some((sr) => ownerRoomIds.has(sr.room_id));
  };
  const canAdd = ownerRoomIds.size > 0;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const devicesByRoom = useMemo(() => {
    return devices.reduce((acc: Record<string, SceneDevice[]>, d) => {
      if (!acc[d.room_id]) acc[d.room_id] = [];
      acc[d.room_id].push(d);
      return acc;
    }, {});
  }, [devices]);

  const getDeviceName = (id: string) => devices.find((d) => d.id === id)?.name ?? id;

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (s: Scene) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      room_ids: (s.scene_rooms || []).map((sr) => sr.room_id),
      description: s.description || "",
      device_states: (s.device_states as SceneDeviceEntry[]).map((e) => ({
        device_id: e.device_id,
        target_state: e.target_state,
      })),
    });
    setShowModal(true);
  };

  const addRoom = (roomId: string) => {
    if (!roomId || formData.room_ids.includes(roomId)) return;
    setFormData((prev) => ({ ...prev, room_ids: [...prev.room_ids, roomId] }));
  };

  const removeRoom = (roomId: string) => {
    const roomDeviceIds = new Set((devicesByRoom[roomId] || []).map((d) => d.id));
    setFormData((prev) => ({
      ...prev,
      room_ids: prev.room_ids.filter((id) => id !== roomId),
      device_states: prev.device_states.filter((a) => !roomDeviceIds.has(a.device_id)),
    }));
  };

  const addActionForRoom = (roomId: string) => {
    const firstDevice = (devicesByRoom[roomId] || [])[0];
    setFormData((prev) => ({
      ...prev,
      device_states: [
        ...prev.device_states,
        {
          device_id: firstDevice?.id ?? "",
          target_state: getDefaultState(firstDevice?.type ?? "Schalter"),
        },
      ],
    }));
  };

  const updateAction = (index: number, device_id: string, target_state?: DeviceState) => {
    setFormData((prev) => {
      const updated = [...prev.device_states];
      if (target_state !== undefined) {
        updated[index] = { ...updated[index], target_state };
      } else {
        const dev = devices.find((d) => d.id === device_id);
        updated[index] = {
          device_id,
          target_state: getDefaultState(dev?.type || "Schalter"),
        };
      }
      return { ...prev, device_states: updated };
    });
  };

  const removeAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      device_states: prev.device_states.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const { room_ids, ...payload } = formData;
    let sceneId: string;
    if (editingId) {
      await sceneService.updateScene(editingId, payload);
      sceneId = editingId;
    } else {
      const created = await sceneService.createScene(payload);
      sceneId = (created as { id: string }[])[0].id;
    }
    await sceneService.assignRooms(sceneId, room_ids);
    setShowModal(false);
    refresh();
  };

  const handleActivate = async (s: Scene) => {
    setActivating(s.id);
    setActivateError(null);
    try {
      const result = await sceneService.activateScene(s);
      if (!result.ok) {
        setActivateError(`Fehler: ${result.errors.join(", ")}`);
      }
      refresh();
    } catch (err) {
      console.error("[Scenes] activateScene Exception:", err);
      setActivateError(String(err));
    } finally {
      setActivating(null);
    }
  };

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.room_ids.length > 0 &&
    formData.device_states.every((a) => a.device_id !== "");

  // Rooms not yet added to the scene
  const unselectedRooms = ownerRooms.filter((r) => !formData.room_ids.includes(r.id));

  if (loading) return <div className="loading">Lade...</div>;

  return (
    <div className="scenes-container">
      <div className="scenes-header">
        <h1>Szenen</h1>
        {canAdd && (
          <button className="add-btn" onClick={openCreate}>
            <LucidePlus size={18} /> Neue Szene
          </button>
        )}
      </div>

      {activateError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#b91c1c", fontSize: "0.9rem" }}>
          {activateError}
        </div>
      )}

      <SceneList
        scenes={scenes}
        canManage={canManageScene}
        activating={activating}
        onActivate={handleActivate}
        onEdit={openEdit}
        onDelete={(id) => {
          const s = scenes.find((s) => s.id === id);
          setDeleteTarget({ id, name: s?.name ?? "Szene" });
        }}
        getDeviceName={getDeviceName}
      />

      <DeleteModal
        itemName={deleteTarget?.name ?? null}
        itemType="Szene"
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await sceneService.deleteScene(deleteTarget.id);
            setDeleteTarget(null);
            refresh();
          }
        }}
      />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{editingId ? "Szene bearbeiten" : "Neue Szene"}</h2>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="z.B. Filmabend"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Beschreibung (optional)</label>
                <textarea
                  placeholder="Kurze Beschreibung..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Per-room device configuration */}
              {formData.room_ids.map((roomId) => {
                const room = ownerRooms.find((r) => r.id === roomId);
                const roomDevices = devicesByRoom[roomId] || [];
                const roomActions = formData.device_states
                  .map((a, i) => ({ ...a, index: i }))
                  .filter((a) => roomDevices.some((d) => d.id === a.device_id) || a.device_id === "");

                return (
                  <div key={roomId} className="scene-room-section">
                    <div className="scene-room-section-header">
                      <span className="scene-room-section-title">{room?.name ?? roomId}</span>
                      <button
                        className="remove-room-btn"
                        onClick={() => removeRoom(roomId)}
                        title="Raum entfernen"
                      >
                        <LucideX size={14} />
                      </button>
                    </div>

                    <div className="device-actions-list">
                      {roomActions.map(({ device_id, target_state, index }) => {
                        const dev = devices.find((d) => d.id === device_id);
                        return (
                          <div key={index} className="device-action-row">
                            <select
                              value={device_id}
                              onChange={(e) => updateAction(index, e.target.value)}
                            >
                              <option value="">Gerät wählen...</option>
                              {roomDevices.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>

                            {dev && (
                              <StateControl
                                type={dev.type}
                                state={target_state}
                                onChange={(s) => updateAction(index, device_id, s)}
                              />
                            )}

                            <button className="remove-action-btn" onClick={() => removeAction(index)}>
                              <LucideX size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className="add-device-action-btn"
                      onClick={() => addActionForRoom(roomId)}
                      disabled={roomDevices.length === 0}
                      type="button"
                    >
                      <LucidePlus size={15} /> Gerät hinzufügen
                    </button>
                  </div>
                );
              })}

              {/* Add another room */}
              {unselectedRooms.length > 0 && (
                <div className="form-group">
                  <label>{formData.room_ids.length === 0 ? "Raum" : "Weiteren Raum hinzufügen"}</label>
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) addRoom(e.target.value); }}
                  >
                    <option value="">Raum auswählen...</option>
                    {unselectedRooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {ownerRooms.length === 0 && (
                <span className="no-rooms-hint">Keine eigenen Räume vorhanden.</span>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-flat" onClick={() => setShowModal(false)}>
                Abbrechen
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!isFormValid}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
