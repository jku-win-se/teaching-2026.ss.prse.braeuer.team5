import React, { useState, useMemo } from "react";
import { useScenes, type SceneDevice } from "../../hooks/useScenes";
import { useRooms } from "../../hooks/useRooms";
import { sceneService } from "../../services/sceneService";
import { LucidePencil, LucideTrash2, LucidePlus, LucideX, LucidePlay, LucideCheck } from "lucide-react";
import type { Scene, DeviceState, SceneDeviceEntry } from "../../types";
import { DeleteModal } from "../modals/DeleteModal";
import "./Scenes.css";

type ActionRow = { device_id: string; target_state: DeviceState };

function getDefaultState(type: string): DeviceState {
  const t = type.trim();
  if (t === "Dimmer") return { on: true, brightness: 80 };
  if (t === "Thermostat") return { on: true, temperature: 21 };
  if (t === "Jalousie") return { on: true, position: 0 };
  if (t === "Sensor") return { value: 0 };
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
  if (t === "Sensor") {
    return (
      <div className="state-control">
        <input
          type="number"
          step="0.1"
          value={state.value as number ?? 0}
          onChange={(e) => onChange({ value: parseFloat(e.target.value) })}
        />
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
  room_id: "",
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
      {scenes.map((s) => (
        <div key={s.id} className="scene-card">
          <div className="scene-info">
            <div className="scene-title-row">
              <span className="scene-name">{s.name}</span>
              <span className="badge-room">{s.rooms?.name}</span>
              <span className={`room-rule-badge ${canManage(s) ? "owner" : "member"}`}>
                {canManage(s) ? "Eigentümer" : "Mitglied"}
              </span>
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
      ))}
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
  const canManageScene = (s: Scene) => ownerRoomIds.has(s.room_id);
  const canAdd = ownerRoomIds.size > 0;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null);

  const devicesByRoom = useMemo(() => {
    return devices.reduce((acc: Record<string, SceneDevice[]>, d) => {
      if (!acc[d.room_id]) acc[d.room_id] = [];
      acc[d.room_id].push(d);
      return acc;
    }, {});
  }, [devices]);

  const roomDevices = useMemo(
    () => devicesByRoom[formData.room_id] || [],
    [devicesByRoom, formData.room_id]
  );

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
      room_id: s.room_id,
      description: s.description || "",
      device_states: (s.device_states as SceneDeviceEntry[]).map((e) => ({
        device_id: e.device_id,
        target_state: e.target_state,
      })),
    });
    setShowModal(true);
  };

  const handleRoomChange = (room_id: string) => {
    setFormData((prev) => ({ ...prev, room_id, device_states: [] }));
  };

  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      device_states: [...prev.device_states, { device_id: "", target_state: { on: true } }],
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
    if (!formData.name.trim() || !formData.room_id) return;
    if (editingId) {
      await sceneService.updateScene(editingId, formData);
    } else {
      await sceneService.createScene(formData);
    }
    setShowModal(false);
    refresh();
  };

  const handleActivate = async (s: Scene) => {
    setActivating(s.id);
    setActivateError(null);
    setActivateSuccess(null);
    try {
      const result = await sceneService.activateScene(s);
      if (!result.ok) {
        setActivateError(`Fehler: ${result.errors.join(", ")}`);
      } else {
        setActivateSuccess(s.name);
        setTimeout(() => setActivateSuccess(null), 3000);
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
    formData.room_id.length > 0 &&
    formData.device_states.every((a) => a.device_id !== "");

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

      {activateSuccess && (
        <div className="activate-success-toast">
          <LucideCheck size={16} />
          Szene &quot;{activateSuccess}&quot; wurde erfolgreich aktiviert.
        </div>
      )}

      {activateError && (
        <div className="activate-error-banner">
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

              <div className="form-group">
                <label>Raum</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => handleRoomChange(e.target.value)}
                >
                  <option value="">Raum auswählen...</option>
                  {ownerRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Gerätezustände</label>
                <div className="device-actions-list">
                  {formData.device_states.map((action, i) => {
                    const dev = devices.find((d) => d.id === action.device_id);
                    return (
                      <div key={i} className="device-action-row">
                        <select
                          value={action.device_id}
                          disabled={!formData.room_id}
                          onChange={(e) => updateAction(i, e.target.value)}
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
                            state={action.target_state}
                            onChange={(s) => updateAction(i, action.device_id, s)}
                          />
                        )}

                        <button className="remove-action-btn" onClick={() => removeAction(i)}>
                          <LucideX size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="add-device-action-btn"
                  onClick={addAction}
                  disabled={!formData.room_id}
                  type="button"
                >
                  <LucidePlus size={15} /> Gerät hinzufügen
                </button>
              </div>
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
