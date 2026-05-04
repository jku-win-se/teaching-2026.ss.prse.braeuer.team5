import React, { useState, useMemo } from 'react';
import { useRules } from '../hooks/useRules';
import { ruleService } from '../services/ruleService';
import { LucidePencil, LucideTrash2, LucidePlus, LucideZap } from 'lucide-react';
import type { TriggerOperator, DeviceState } from '../types';
import './Schedules.css';
import './Rules.css';

type ConditionField = keyof DeviceState;

const FIELD_OPTIONS: Record<string, { field: ConditionField; label: string }[]> = {
  Thermostat: [{ field: 'temperature', label: 'Temperatur (°C)' }],
  Dimmer:     [{ field: 'brightness', label: 'Helligkeit (%)' }, { field: 'on', label: 'Ein/Aus' }],
  Schalter:   [{ field: 'on', label: 'Ein/Aus' }],
  Sensor:     [{ field: 'on', label: 'Aktiv' }, { field: 'value', label: 'Wert' }],
  Jalousie:   [{ field: 'position', label: 'Position' }],
};

const NUMERIC_OPERATORS: TriggerOperator[] = ['==', '!=', '>', '>=', '<', '<='];
const BOOL_OPERATORS: TriggerOperator[] = ['==', '!='];

const isBoolField = (field: ConditionField) => field === 'on';
const isStringField = (field: ConditionField) => field === 'position' || field === 'value';

const getDefaultConditionValue = (field: ConditionField): boolean | number | string => {
  if (field === 'on') return true;
  if (field === 'temperature') return 25;
  if (field === 'brightness') return 80;
  if (field === 'position') return 'offen';
  return '';
};

const getDefaultActionState = (type: string): DeviceState => {
  if (type === 'Thermostat') return { temperature: 21 };
  if (type === 'Dimmer')     return { brightness: 0 };
  if (type === 'Jalousie')   return { position: 'geschlossen' };
  return { on: false };
};

const formatConditionSummary = (rule: any, devices: any[]): string => {
  const triggerDev = devices.find((d) => d.id === rule.device_id);
  const cond = rule.condition;
  if (!cond || !triggerDev) return '—';
  const fieldLabel = FIELD_OPTIONS[triggerDev.type]?.find((f) => f.field === cond.field)?.label ?? cond.field;
  return `${triggerDev.name} · ${fieldLabel} ${cond.operator} ${cond.value}`;
};

const formatActionSummary = (rule: any, devices: any[]): string => {
  const actionDev = devices.find((d) => d.id === rule.action?.device_id);
  const state: DeviceState = rule.action?.state ?? {};
  if (!actionDev) return '—';
  let stateText = '';
  if (state.on !== undefined)           stateText = state.on ? 'EIN' : 'AUS';
  else if (state.brightness !== undefined) stateText = `${state.brightness}%`;
  else if (state.temperature !== undefined) stateText = `${state.temperature}°C`;
  else if (state.position !== undefined)   stateText = String(state.position);
  return `${actionDev.name}: ${stateText}`;
};

const RuleList = React.memo(({ rules, devices, onEdit, onDelete, onToggle }: any) => {
  if (rules.length === 0) {
    return (
      <div style={{ opacity: 0.5, marginTop: 32, textAlign: 'center' }}>
        Noch keine Regeln angelegt.
      </div>
    );
  }
  return (
    <div className="schedules-grid">
      {rules.map((r: any) => (
        <div key={r.id} className="schedule-item-card">
          <div className="schedule-content">
            <div className="schedule-title-row">
              <span className="schedule-name">{r.name}</span>
              <span className="badge-room">
                {devices.find((d: any) => d.id === r.device_id)?.rooms?.name}
              </span>
            </div>
            <div className="rule-condition-line">
              <LucideZap size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Wenn {formatConditionSummary(r, devices)}
            </div>
            <div className="rule-condition-line">
              → {formatActionSummary(r, devices)}
            </div>
          </div>
          <div className="schedule-actions">
            <button className="action-btn edit-btn" onClick={() => onEdit(r)}>
              <LucidePencil size={18} />
            </button>
            <button className="action-btn delete-btn" onClick={() => onDelete(r.id)}>
              <LucideTrash2 size={18} />
            </button>
            <label className="switch">
              <input
                type="checkbox"
                checked={r.is_active}
                onChange={() => onToggle(r)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
});

const emptyForm = () => ({
  name: '',
  room_id: '',
  device_id: '',
  condition: {
    field: 'on' as ConditionField,
    operator: '==' as TriggerOperator,
    value: true as boolean | number | string,
  },
  action: {
    device_id: '',
    state: { on: false } as DeviceState,
  }
});

export const Rules: React.FC = () => {
  const { rules, devices, loading, refresh, toggleRuleLocal } = useRules();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReturnType<typeof emptyForm>>(emptyForm());

  const groupedDevices = useMemo(() => {
    return devices.reduce((acc: any, device: any) => {
      const roomName = device.rooms?.name || 'Unbekannter Raum';
      if (!acc[roomName]) acc[roomName] = [];
      acc[roomName].push(device);
      return acc;
    }, {});
  }, [devices]);

  const triggerDeviceType = useMemo(() => {
    const dev = devices.find((d) => d.id === formData.device_id);
    return dev?.type?.trim() || '';
  }, [formData.device_id, devices]);

  const actionDeviceType = useMemo(() => {
    const dev = devices.find((d) => d.id === formData.action.device_id);
    return dev?.type?.trim() || '';
  }, [formData.action.device_id, devices]);

  const availableFields = FIELD_OPTIONS[triggerDeviceType] ?? [{ field: 'on' as ConditionField, label: 'Ein/Aus' }];
  const availableOperators = isBoolField(formData.condition.field) || isStringField(formData.condition.field)
    ? BOOL_OPERATORS
    : NUMERIC_OPERATORS;

  const handleTriggerDeviceChange = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const type = dev?.type?.trim() || '';
    const fields = FIELD_OPTIONS[type] ?? [{ field: 'on' as ConditionField, label: 'Ein/Aus' }];
    const firstField = fields[0].field;
    setFormData((prev) => ({
      ...prev,
      device_id: deviceId,
      room_id: dev?.room_id || '',
      condition: {
        field: firstField,
        operator: isBoolField(firstField) || isStringField(firstField) ? '==' : '>',
        value: getDefaultConditionValue(firstField),
      },
    }));
  };

  const handleActionDeviceChange = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const type = dev?.type?.trim() || '';
    setFormData((prev) => ({
      ...prev,
      action: {
        device_id: deviceId,
        state: getDefaultActionState(type),
      },
    }));
  };

  const handleConditionFieldChange = (field: ConditionField) => {
    setFormData((prev) => ({
      ...prev,
      condition: {
        field,
        operator: isBoolField(field) || isStringField(field) ? '==' : '>',
        value: getDefaultConditionValue(field),
      },
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      if (editingId) {
        await ruleService.updateRule(editingId, formData);
      } else {
        await ruleService.createRule(formData);
      }
      setShowModal(false);
      refresh();
    } catch (err: any) {
      setSaveError(err?.message ?? 'Unbekannter Fehler beim Speichern.');
    }
  };

  if (loading) return <div className="loading">Lade...</div>;

  return (
    <div className="schedules-container">
      <div className="schedules-header">
        <h1>Regeln</h1>
        <button
          className="add-btn"
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm());
            setSaveError(null);
            setShowModal(true);
          }}
        >
          <LucidePlus size={18} /> Neue Regel
        </button>
      </div>

      <RuleList
        rules={rules}
        devices={devices}
        onEdit={(r: any) => {
          setEditingId(r.id);
          setFormData({
            name: r.name,
            room_id: r.room_id ?? '',
            device_id: r.device_id,
            condition: r.condition,
            action: r.action,
          });
          setSaveError(null);
          setShowModal(true);
        }}
        onDelete={async (id: string) => {
          if (window.confirm('Regel löschen?')) {
            await ruleService.deleteRule(id);
            refresh();
          }
        }}

        onToggle={(r: any) => {
            const newValue = !r.is_active;

            ruleService.toggleRule(r.id, newValue).then(() => {
            // Lokal State updaten statt neu laden
              toggleRuleLocal(r.id, newValue);
            });
        }}

      />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{editingId ? 'Regel bearbeiten' : 'Neue Regel'}</h2>

            <div className="modal-body">
              <div className="form-group">
                <label>Bezeichnung</label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder="Name der Regel"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <p className="rule-section-header">Auslöser</p>

              <div className="form-group">
                <label>Gerät überwachen</label>
                <select
                  value={formData.device_id}
                  onChange={(e) => handleTriggerDeviceChange(e.target.value)}
                >
                  <option value="">Gerät auswählen...</option>
                  {Object.keys(groupedDevices).map((roomName) => (
                    <optgroup key={roomName} label={roomName}>
                      {groupedDevices[roomName].map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {formData.device_id && (
                <div className="form-row-half">
                  <div className="form-group">
                    <label>Eigenschaft</label>
                    <select
                      value={formData.condition.field}
                      onChange={(e) => handleConditionFieldChange(e.target.value as ConditionField)}
                    >
                      {availableFields.map((f) => (
                        <option key={f.field} value={f.field}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Operator</label>
                    <select
                      value={formData.condition.operator}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: { ...formData.condition, operator: e.target.value as TriggerOperator },
                        })
                      }
                    >
                      {availableOperators.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.device_id && (
                <div className="form-group">
                  <label>Vergleichswert</label>

                  {isBoolField(formData.condition.field) && (
                    <select
                      value={String(formData.condition.value)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: { ...formData.condition, value: e.target.value === 'true' },
                        })
                      }
                    >
                      <option value="true">EIN / Aktiv</option>
                      <option value="false">AUS / Inaktiv</option>
                    </select>
                  )}

                  {formData.condition.field === 'position' && (
                    <select
                      value={String(formData.condition.value)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condition: { ...formData.condition, value: e.target.value },
                        })
                      }
                    >
                      <option value="offen">Offen</option>
                      <option value="geschlossen">Geschlossen</option>
                      <option value="stop">Stop</option>
                    </select>
                  )}

                  {!isBoolField(formData.condition.field) && formData.condition.field !== 'position' && (
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step={formData.condition.field === 'temperature' ? '0.5' : '1'}
                        value={Number(formData.condition.value)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition: { ...formData.condition, value: parseFloat(e.target.value) },
                          })
                        }
                      />
                      {formData.condition.field === 'temperature' && <span className="unit-label">°C</span>}
                      {formData.condition.field === 'brightness' && <span className="unit-label">%</span>}
                    </div>
                  )}
                </div>
              )}

              <p className="rule-section-header">Aktion</p>

              <div className="form-group">
                <label>Ziel-Gerät</label>
                <select
                  value={formData.action.device_id}
                  onChange={(e) => handleActionDeviceChange(e.target.value)}
                >
                  <option value="">Gerät auswählen...</option>
                  {Object.keys(groupedDevices).map((roomName) => (
                    <optgroup key={roomName} label={roomName}>
                      {groupedDevices[roomName].map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {formData.action.device_id && (
                <div className="form-group">
                  <label>Aktion</label>

                  {actionDeviceType === 'Thermostat' && (
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.5"
                        value={formData.action.state.temperature ?? 21}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            action: { ...formData.action, state: { temperature: parseFloat(e.target.value) } },
                          })
                        }
                      />
                      <span className="unit-label">°C</span>
                    </div>
                  )}

                  {actionDeviceType === 'Dimmer' && (
                    <div className="input-with-unit">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.action.state.brightness ?? 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            action: { ...formData.action, state: { brightness: parseInt(e.target.value) } },
                          })
                        }
                      />
                      <span className="unit-label">%</span>
                    </div>
                  )}

                  {actionDeviceType === 'Jalousie' && (
                    <select
                      value={formData.action.state.position ?? 'geschlossen'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action: {
                            ...formData.action,
                            state: { position: e.target.value as 'offen' | 'geschlossen' | 'stop' },
                          },
                        })
                      }
                    >
                      <option value="offen">Offen</option>
                      <option value="geschlossen">Geschlossen</option>
                      <option value="stop">Stop</option>
                    </select>
                  )}

                  {(actionDeviceType === 'Schalter' ||
                    actionDeviceType === 'Sensor' ||
                    !['Thermostat', 'Dimmer', 'Jalousie'].includes(actionDeviceType)) && (
                    <select
                      value={formData.action.state.on ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action: { ...formData.action, state: { on: e.target.value === 'true' } },
                        })
                      }
                    >
                      <option value="true">Einschalten</option>
                      <option value="false">Ausschalten</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            {saveError && <p className="form-error">{saveError}</p>}

            <div className="modal-footer">
              <button className="btn-flat" onClick={() => setShowModal(false)}>
                Abbrechen
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};