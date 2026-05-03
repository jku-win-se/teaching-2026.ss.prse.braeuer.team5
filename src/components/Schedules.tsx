import React, { useEffect, useState } from 'react';
import { scheduleService } from '../services/scheduleService';
import { supabase } from '../config/supabaseClient';
import { LucidePencil, LucideTrash2, LucidePlus } from 'lucide-react';
import './Schedules.css';

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    room_id: '',
    device_id: '',
    time: '08:00',
    days: [] as number[],
    on: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const sData = await scheduleService.fetchAllSchedules();
      setSchedules(sData);

      const { data: dData } = await supabase
        .from('devices')
        .select(`id, name, room_id, rooms (name)`);
      setDevices(dData || []);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedDevices = devices.reduce((acc: any, device: any) => {
    const roomName = device.rooms?.name || 'Unbekannter Raum';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(device);
    return acc;
  }, {});

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      room_id: s.room_id,
      device_id: s.device_id,
      time: s.time.substring(0, 5),
      days: s.days,
      on: s.action_value.on
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.device_id || !formData.name) {
      alert("Bitte Name und Gerät angeben");
      return;
    }

    try {
      const payload = { ...formData, action_value: { on: formData.on } };
      if (editingId) {
        await scheduleService.updateSchedule(editingId, payload);
      } else {
        await scheduleService.createSchedule(payload);
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', room_id: '', device_id: '', time: '08:00', days: [], on: true });
      loadData();
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Zeitplan wirklich löschen?")) return;
    try {
      await scheduleService.deleteSchedule(id);
      loadData();
    } catch (err) {
      alert("Fehler beim Löschen");
    }
  };

  if (loading) return <div className="loading">Lade Zeitpläne...</div>;

  return (
    <div className="schedules-container">
      <div className="schedules-header">
        <h1>Zeitpläne</h1>
        <button className="add-btn" onClick={() => { setEditingId(null); setShowModal(true); }}>
          <LucidePlus size={18} /> Neuer Zeitplan
        </button>
      </div>

      <div className="schedules-grid">
        {schedules.map(s => (
          <div key={s.id} className="schedule-item-card">
            <div className="schedule-content">
              <div className="schedule-title-row">
                <span className="schedule-name">{s.name}</span>
                <span className="badge-room">{s.devices?.rooms?.name}</span>
              </div>
              <div className="schedule-subtext">
                {s.time.substring(0, 5)} • {s.devices?.name} ({s.action_value.on ? 'An' : 'Aus'})
              </div>
              <div className="schedule-days-row">
                {DAYS_SHORT.map((d, i) => {
                  const jsDayIndex = (i + 1) % 7;
                  return (
                    <span key={i} className={`day-chip ${s.days.includes(jsDayIndex) ? 'active' : ''}`}>
                      {d.substring(0, 1)}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="schedule-actions">
              <button className="action-btn edit-btn" onClick={() => openEditModal(s)}>
                <LucidePencil size={18} />
              </button>
              <button className="action-btn delete-btn" onClick={() => handleDelete(s.id)}>
                <LucideTrash2 size={18} />
              </button>
              <div className="action-divider"></div>
              <div className="toggle-wrapper">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={s.is_active} 
                    onChange={() => scheduleService.toggleSchedule(s.id, !s.is_active).then(loadData)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{editingId ? 'Zeitplan bearbeiten' : 'Neuer Zeitplan'}</h2>
            <div className="modal-body">
              
              <div className="form-group">
                <label>Bezeichnung</label>
                <input 
                  type="text" 
                  placeholder="z.B. Kaffeemaschine morgens"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="form-group">
                <label>Gerät</label>
                <select 
                  value={formData.device_id} 
                  onChange={e => {
                    const dev = devices.find(d => d.id === e.target.value);
                    setFormData({...formData, device_id: e.target.value, room_id: dev?.room_id || ''});
                  }}
                >
                  <option value="">Wählen...</option>
                  {Object.keys(groupedDevices).map(roomName => (
                    <optgroup key={roomName} label={roomName}>
                      {groupedDevices[roomName].map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
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
                    onChange={e => setFormData({...formData, time: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Aktion</label>
                  <select 
                    value={String(formData.on)} 
                    onChange={e => setFormData({...formData, on: e.target.value === 'true'})}
                  >
                    <option value="true">Einschalten</option>
                    <option value="false">Ausschalten</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Wochentage</label>
                <div className="day-picker">
                  {DAYS_SHORT.map((d, i) => {
                    const jsDayIndex = (i + 1) % 7;
                    const isSelected = formData.days.includes(jsDayIndex);
                    return (
                      <button 
                        key={i} 
                        type="button"
                        className={isSelected ? 'active' : ''}
                        onClick={() => {
                          const newDays = isSelected 
                            ? formData.days.filter(day => day !== jsDayIndex) 
                            : [...formData.days, jsDayIndex];
                          setFormData({...formData, days: newDays});
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-flat" onClick={() => setShowModal(false)}>Abbrechen</button>
              <button className="btn-primary" onClick={handleSave}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};