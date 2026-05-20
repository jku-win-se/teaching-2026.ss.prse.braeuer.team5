import React, { useState, useMemo } from 'react';
import { useSchedules, type ScheduleDevice } from '../../hooks/useSchedules';
import { useRules } from '../../hooks/useRules';
import { useRooms } from '../../hooks/useRooms';
import { scheduleService } from '../../services/scheduleService';
import { detectScheduleConflicts } from '../../services/conflictService';
import { LucidePencil, LucideTrash2, LucidePlus } from 'lucide-react';
import type { Conflict, Schedule, DeviceState } from '../../types';
import { DeleteModal } from '../modals/DeleteModal';
import './Schedules.css';

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (s: Schedule) => void;
  onDelete: (id: string) => void;
  onToggle: (s: Schedule) => void;
  canManage: (s: Schedule) => boolean;
}

const ScheduleList = React.memo(
  ({ schedules, onEdit, onDelete, onToggle, canManage }: ScheduleListProps) => {
    return (
      <div className="schedules-grid">
        {schedules.map((s) => (
          <div key={s.id} className="schedule-item-card">
            <div className="schedule-content">

              <div className="schedule-title-row">
                <span className="schedule-name">{s.name}</span>
                <span className="badge-room">
                  {s.devices?.rooms?.name}
                </span>
                <span className={`room-rule-badge ${canManage(s) ? 'owner' : 'member'}`}>
                  {canManage(s) ? 'Eigentümer' : 'Mitglied'}
                </span>
              </div>

              <div className="schedule-subtext">
                {s.time.substring(0, 5)} • {s.devices?.name}
                <span className="action-preview">
                  {' '}
                  (
                  {s.action_value.on !== undefined
                    ? s.action_value.on
                      ? 'An'
                      : 'Aus'
                    : s.action_value.brightness !== undefined
                    ? `${s.action_value.brightness}%`
                    : s.action_value.temperature !== undefined
                    ? `${s.action_value.temperature}°C`
                    : s.action_value.position !== undefined
                    ? `Pos: ${s.action_value.position}%`
                    : 'Aktiv'}
                  )
                </span>
              </div>

              <div className="schedule-days-row">
                {DAYS_SHORT.map((d, i) => {
                  const jsDayIndex = (i + 1) % 7;

                  return (
                    <span
                      key={i}
                      className={`day-chip ${
                        s.days.includes(jsDayIndex) ? 'active' : ''
                      }`}
                    >
                      {d.substring(0, 1)}
                    </span>
                  );
                })}
              </div>

            </div>

            <div className="schedule-actions">
              {canManage(s) && (
                <>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(s)}
                  >
                    <LucidePencil size={18} />
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(s.id)}
                  >
                    <LucideTrash2 size={18} />
                  </button>
                </>
              )}

              <label className="switch">
                <input
                  type="checkbox"
                  checked={s.is_active}
                  onChange={() => onToggle(s)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export const Schedules: React.FC = () => {
  const { schedules, devices, loading, refresh } = useSchedules();
  const { rules } = useRules();
  const { rooms } = useRooms();
  const ownerRoomIds = useMemo(
    () => new Set(rooms.filter((r) => r.role === 'owner').map((r) => r.id)),
    [rooms]
  );
  const canManageSchedule = (s: Schedule) => ownerRoomIds.has(s.room_id);
  const canAddSchedules = ownerRoomIds.size > 0;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    room_id: '',
    device_id: '',
    time: '08:00',
    days: [] as number[],
    action_value: { on: true } as DeviceState,
  });

  const groupedDevices = useMemo(() => {
    return devices
      .filter((d) => ownerRoomIds.has(d.room_id))
      .reduce((acc: Record<string, ScheduleDevice[]>, device) => {
        const roomName = device.rooms?.name || 'Unbekannter Raum';
        if (!acc[roomName]) acc[roomName] = [];
        acc[roomName].push(device);
        return acc;
      }, {});
  }, [devices, ownerRoomIds]);

  const deviceType = useMemo(() => {
    if (!formData.device_id) return '';

    const dev = devices.find((d) => d.id === formData.device_id);
    return dev?.type?.trim() || '';
  }, [formData.device_id, devices]);

  const handleDeviceChange = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const type = dev?.type?.trim() || '';

    let initialAction: DeviceState = { on: true };

    if (type === 'Dimmer') {
      initialAction = { brightness: 80 };
    } else if (type === 'Thermostat') {
      initialAction = { temperature: 21.0 };
    } else if (type === 'Jalousie') {
      initialAction = { position: 0 };
    }

    setFormData((prev) => ({
      ...prev,
      device_id: deviceId,
      room_id: dev?.room_id || '',
      action_value: initialAction,
    }));
  };

  const handleSave = async () => {
    if (conflicts.length === 0) {
      const found = detectScheduleConflicts(
        { id: editingId ?? undefined, ...formData },
        schedules,
        rules
      );
      if (found.length > 0) {
        setConflicts(found);
        return;
      }
    }
    setConflicts([]);
    if (editingId) {
      await scheduleService.updateSchedule(editingId, formData);
    } else {
      await scheduleService.createSchedule(formData);
    }
    setShowModal(false);
    refresh();
  };

  if (loading) return <div className="loading">Lade...</div>;

  return (
    <div className="schedules-container">

      <div className="schedules-header">
        <h1>Zeitpläne</h1>

        {canAddSchedules && (
          <button
            className="add-btn"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                room_id: '',
                device_id: '',
                time: '08:00',
                days: [],
                action_value: { on: true },
              });
              setConflicts([]);
              setShowModal(true);
            }}
          >
            <LucidePlus size={18} /> Neuer Zeitplan
          </button>
        )}
      </div>

      <ScheduleList
        schedules={schedules}
        canManage={canManageSchedule}
        onEdit={(s: Schedule) => {
          setEditingId(s.id);
          setFormData({
            name: s.name,
            room_id: s.room_id,
            device_id: s.device_id,
            time: s.time.substring(0, 5),
            days: s.days,
            action_value: s.action_value,
          });
          setConflicts([]);
          setShowModal(true);
        }}
        onDelete={(id: string) => {
          const s = schedules.find((s) => s.id === id);
          setDeleteTarget({ id, name: s?.name ?? 'Zeitplan' });
        }}
        onToggle={(s: Schedule) =>
          scheduleService
            .toggleSchedule(s.id, !s.is_active)
            .then(refresh)
        }
      />

      <DeleteModal
        itemName={deleteTarget?.name ?? null}
        itemType="Zeitplan"
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await scheduleService.deleteSchedule(deleteTarget.id);
            setDeleteTarget(null);
            refresh();
          }
        }}
      />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">

            <h2>
              {editingId ? 'Zeitplan bearbeiten' : 'Neuer Zeitplan'}
            </h2>

            <div className="modal-body">

              <div className="form-group">
                <label>Bezeichnung</label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder="Name des Zeitplans"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Gerät</label>
                <select
                  value={formData.device_id}
                  onChange={(e) =>
                    handleDeviceChange(e.target.value)
                  }
                >
                  <option value="">Gerät auswählen...</option>

                  {Object.keys(groupedDevices).map((roomName) => (
                    <optgroup key={roomName} label={roomName}>
                      {groupedDevices[roomName].map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-row-half">

                <div className="form-group">
                  <label>Uhrzeit</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Aktion</label>

                  {deviceType === 'Thermostat' && (
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.5"
                        value={
                          formData.action_value.temperature ?? 21
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            action_value: {
                              temperature: parseFloat(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                      <span className="unit-label">°C</span>
                    </div>
                  )}

                  {deviceType === 'Dimmer' && (
                    <div className="input-with-unit">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          formData.action_value.brightness ?? 80
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            action_value: {
                              brightness: parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                      <span className="unit-label">%</span>
                    </div>
                  )}

                  {deviceType === 'Jalousie' && (
                    <select
                      value={
                        formData.action_value.position ?? 0
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action_value: {
                            position: parseInt(
                              e.target.value
                            ),
                          },
                        })
                      }
                    >
                      <option value="0">Zu</option>
                      <option value="100">Auf</option>
                    </select>
                  )}

                  {(deviceType === 'Schalter' ||
                    !['Thermostat', 'Dimmer', 'Jalousie'].includes(
                      deviceType
                    )) && (
                    <select
                      value={
                        formData.action_value.on
                          ? 'true'
                          : 'false'
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action_value: {
                            on: e.target.value === 'true',
                          },
                        })
                      }
                    >
                      <option value="true">
                        Einschalten
                      </option>
                      <option value="false">
                        Ausschalten
                      </option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Wochentage</label>

                <div className="days-selection">
                  {DAYS_SHORT.map((d, i) => {
                    const jsDayIndex = (i + 1) % 7;
                    const isSelected =
                      formData.days.includes(jsDayIndex);

                    return (
                      <button
                        key={i}
                        type="button"
                        className={`day-selection-btn ${
                          isSelected ? 'active' : ''
                        }`}
                        onClick={() => {
                          const newDays = isSelected
                            ? formData.days.filter(
                                (day) =>
                                  day !== jsDayIndex
                              )
                            : [
                                ...formData.days,
                                jsDayIndex,
                              ];

                          setFormData({
                            ...formData,
                            days: newDays,
                          });
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {conflicts.length > 0 && (
              <div className="conflict-warning">
                <p className="conflict-warning-title">Konflikt erkannt</p>
                <ul className="conflict-warning-list">
                  {conflicts.map((c, i) => <li key={i}>{c.message}</li>)}
                </ul>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn-flat"
                onClick={() => setShowModal(false)}
              >
                Abbrechen
              </button>

              <button
                className="btn-primary"
                onClick={handleSave}
              >
                {conflicts.length > 0 ? 'Trotzdem speichern' : 'Speichern'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
