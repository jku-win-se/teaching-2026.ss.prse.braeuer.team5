import React, { useState, useMemo } from "react";
import { useVacationMode } from "../../hooks/useVacationMode";
import { useRooms } from "../../hooks/useRooms";
import { vacationModeService } from "../../services/vacationModeService";
import { LucidePencil, LucideTrash2, LucidePlus, LucideInfo } from "lucide-react";
import type { VacationMode as VacationModeType } from "../../types";
import { DeleteModal } from "../modals/DeleteModal";
import "./VacationMode.css";

type VacationStatus = "active" | "pending" | "expired" | "disabled";

function getStatus(mode: VacationModeType): VacationStatus {
  const today = new Date().toISOString().split("T")[0];
  if (!mode.is_active) return "disabled";
  if (mode.end_date < today) return "expired";
  if (mode.start_date > today) return "pending";
  return "active";
}

const STATUS_LABEL: Record<VacationStatus, string> = {
  active: "Aktiv",
  pending: "Ausstehend",
  expired: "Abgelaufen",
  disabled: "Deaktiviert",
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const EMPTY_FORM = {
  name: "",
  scene_id: "" as string | null,
  start_date: "",
  end_date: "",
  daily_time: "18:00",
  room_ids: [] as string[],
};

export const VacationMode: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { modes, scenes, loading, refresh } = useVacationMode();
  const { rooms } = useRooms();

  const ownerRoomIds = useMemo(
    () => new Set(rooms.filter((r) => r.role === "owner").map((r) => r.id)),
    [rooms]
  );
  const ownerRooms = useMemo(() => rooms.filter((r) => r.role === "owner"), [rooms]);
  const canAdd = ownerRoomIds.size > 0;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const scenesForSelectedRooms = useMemo(
    () => scenes.filter(
      (s) => s.scene_rooms?.some((sr) => formData.room_ids.includes(sr.room_id))
    ),
    [scenes, formData.room_ids]
  );

  const activeCount = useMemo(
    () => modes.filter((m) => getStatus(m) === "active").length,
    [modes]
  );

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (m: VacationModeType) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      scene_id: m.scene_id,
      start_date: m.start_date,
      end_date: m.end_date,
      daily_time: m.daily_time.substring(0, 5),
      room_ids: (m.rooms || []).map((r) => r.id),
    });
    setShowModal(true);
  };

  const toggleRoom = (roomId: string) => {
    setFormData((prev) => {
      const has = prev.room_ids.includes(roomId);
      const room_ids = has
        ? prev.room_ids.filter((id) => id !== roomId)
        : [...prev.room_ids, roomId];
      // Reset scene if it no longer belongs to selected rooms
      return { ...prev, room_ids, scene_id: "" };
    });
  };

  const handleSave = async () => {
    const { room_ids, ...payload } = formData;
    let vmId: string;
    if (editingId) {
      await vacationModeService.update(editingId, { ...payload, scene_id: payload.scene_id || null });
      vmId = editingId;
    } else {
      const created = await vacationModeService.create({ ...payload, scene_id: payload.scene_id || null });
      vmId = (created as { id: string }[])[0].id;
    }
    await vacationModeService.assignRooms(vmId, room_ids);
    setShowModal(false);
    refresh();
  };

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.start_date &&
    formData.end_date &&
    formData.daily_time &&
    formData.end_date >= formData.start_date &&
    formData.room_ids.length > 0;

  if (loading) return <div className="loading">Lade...</div>;

  return (
    <div className="vacation-container">
      <div className="vacation-header">
        {!embedded && <h1>Urlaubsmodus</h1>}
        {canAdd && (
          <button className="add-btn" onClick={openCreate}>
            <LucidePlus size={18} /> Neuer Urlaubsmodus
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="vacation-override-notice">
          <LucideInfo size={16} />
          {activeCount === 1
            ? "1 Urlaubsmodus aktiv — Zeitpläne in den betroffenen Räumen werden übersprungen."
            : `${activeCount} Urlaubsmodi aktiv — Zeitpläne in den betroffenen Räumen werden übersprungen.`}
        </div>
      )}

      {modes.length === 0 && (
        <div className="empty-state">Noch kein Urlaubsmodus angelegt.</div>
      )}

      {modes.map((m) => {
        const status = getStatus(m);
        const canManage =
          (m.rooms || []).length === 0
            ? ownerRoomIds.size > 0
            : (m.rooms || []).some((r) => ownerRoomIds.has(r.id));
        return (
          <div key={m.id} className="vacation-card">
            <div className="vacation-info">
              <div className="vacation-title-row">
                <span className="vacation-name">{m.name}</span>
                <span className={`status-badge ${status}`}>{STATUS_LABEL[status]}</span>
              </div>

              <div className="vacation-room-chips">
                {(m.rooms || []).map((r) => (
                  <span key={r.id} className="vacation-room-chip">{r.name}</span>
                ))}
                {(m.rooms || []).length === 0 && (
                  <span className="vacation-room-chip vacation-room-chip--empty">Keine Räume</span>
                )}
              </div>

              <div className="vacation-details">
                <div className="vacation-detail-item">
                  <span className="detail-label">Zeitraum</span>
                  <span className="detail-value">
                    {formatDate(m.start_date)} – {formatDate(m.end_date)}
                  </span>
                </div>
                <div className="vacation-detail-item">
                  <span className="detail-label">Uhrzeit</span>
                  <span className="detail-value">{m.daily_time.substring(0, 5)} Uhr</span>
                </div>
                <div className="vacation-detail-item">
                  <span className="detail-label">Szene</span>
                  <span className="detail-value">{m.scenes?.name ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="vacation-actions">
              {canManage && (
                <>
                  <button className="action-btn edit-btn" onClick={() => openEdit(m)}>
                    <LucidePencil size={18} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                  >
                    <LucideTrash2 size={18} />
                  </button>
                </>
              )}
              {canManage && (
                <label className="switch" title={m.is_active ? "Deaktivieren" : "Aktivieren"}>
                  <input
                    type="checkbox"
                    checked={m.is_active}
                    onChange={() => vacationModeService.toggle(m.id, !m.is_active).then(refresh)}
                  />
                  <span className="slider round" />
                </label>
              )}
            </div>
          </div>
        );
      })}

      <DeleteModal
        itemName={deleteTarget?.name ?? null}
        itemType="Urlaubsmodus"
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await vacationModeService.delete(deleteTarget.id);
            setDeleteTarget(null);
            refresh();
          }
        }}
      />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{editingId ? "Urlaubsmodus bearbeiten" : "Neuer Urlaubsmodus"}</h2>
            <div className="modal-body">

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="z.B. Sommerurlaub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Räume</label>
                <div className="room-checkbox-list">
                  {ownerRooms.map((r) => (
                    <label key={r.id} className="room-checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.room_ids.includes(r.id)}
                        onChange={() => toggleRoom(r.id)}
                      />
                      {r.name}
                    </label>
                  ))}
                  {ownerRooms.length === 0 && (
                    <span className="no-rooms-hint">Keine eigenen Räume vorhanden.</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Szene (optional)</label>
                <select
                  value={formData.scene_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, scene_id: e.target.value || null })}
                  disabled={formData.room_ids.length === 0}
                >
                  <option value="">Keine Szene</option>
                  {scenesForSelectedRooms.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-half">
                <div className="form-group">
                  <label>Von</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Bis</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    min={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tägliche Aktivierungszeit</label>
                <input
                  type="time"
                  value={formData.daily_time}
                  onChange={(e) => setFormData({ ...formData, daily_time: e.target.value })}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-flat" onClick={() => setShowModal(false)}>Abbrechen</button>
              <button className="btn-primary" onClick={handleSave} disabled={!isFormValid}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
