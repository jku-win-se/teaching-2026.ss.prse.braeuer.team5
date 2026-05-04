import React from 'react';
import type { TriggerOperator, Device, Conflict } from '../../types';
import {
  type ConditionField,
  type RuleFormData,
  isBoolField,
  isStringField,
  NUMERIC_OPERATORS,
  BOOL_OPERATORS,
  FIELD_OPTIONS,
} from './ruleUtils';

type GroupedDevices = Record<string, Device[]>;

type RuleFormModalProps = {
  editingId: string | null;
  formData: RuleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RuleFormData>>;
  groupedDevices: GroupedDevices;
  triggerDeviceType: string;
  actionDeviceType: string;
  onTriggerDeviceChange: (deviceId: string) => void;
  onActionDeviceChange: (deviceId: string) => void;
  onConditionFieldChange: (field: ConditionField) => void;
  onSave: () => void;
  onClose: () => void;
  saveError: string | null;
  conflicts: Conflict[];
};

const DeviceSelect = ({
  value,
  onChange,
  groupedDevices,
}: {
  value: string;
  onChange: (id: string) => void;
  groupedDevices: GroupedDevices;
}) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">Gerät auswählen...</option>
    {Object.keys(groupedDevices).map((roomName) => (
      <optgroup key={roomName} label={roomName}>
        {groupedDevices[roomName].map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </optgroup>
    ))}
  </select>
);

const ConditionValueInput = ({
  formData,
  setFormData,
}: {
  formData: RuleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RuleFormData>>;
}) => {
  const { field } = formData.condition;

  if (isBoolField(field)) {
    return (
      <select
        value={String(formData.condition.value)}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            condition: { ...prev.condition, value: e.target.value === 'true' },
          }))
        }
      >
        <option value="true">EIN / Aktiv</option>
        <option value="false">AUS / Inaktiv</option>
      </select>
    );
  }

  if (field === 'position') {
    return (
      <select
        value={String(formData.condition.value)}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            condition: { ...prev.condition, value: e.target.value },
          }))
        }
      >
        <option value="offen">Offen</option>
        <option value="geschlossen">Geschlossen</option>
        <option value="stop">Stop</option>
      </select>
    );
  }

  return (
    <div className="input-with-unit">
      <input
        type="number"
        step={field === 'temperature' ? '0.5' : '1'}
        value={Number(formData.condition.value)}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            condition: { ...prev.condition, value: parseFloat(e.target.value) },
          }))
        }
      />
      {field === 'temperature' && <span className="unit-label">°C</span>}
      {field === 'brightness' && <span className="unit-label">%</span>}
    </div>
  );
};

const ActionValueInput = ({
  formData,
  setFormData,
  actionDeviceType,
}: {
  formData: RuleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RuleFormData>>;
  actionDeviceType: string;
}) => {
  if (actionDeviceType === 'Thermostat') {
    return (
      <div className="input-with-unit">
        <input
          type="number"
          step="0.5"
          value={formData.action.state.temperature ?? 21}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              action: { ...prev.action, state: { temperature: parseFloat(e.target.value) } },
            }))
          }
        />
        <span className="unit-label">°C</span>
      </div>
    );
  }

  if (actionDeviceType === 'Dimmer') {
    return (
      <div className="input-with-unit">
        <input
          type="number"
          min="0"
          max="100"
          value={formData.action.state.brightness ?? 0}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              action: { ...prev.action, state: { brightness: parseInt(e.target.value) } },
            }))
          }
        />
        <span className="unit-label">%</span>
      </div>
    );
  }

  if (actionDeviceType === 'Jalousie') {
    return (
      <select
        value={formData.action.state.position ?? 'geschlossen'}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            action: {
              ...prev.action,
              state: { position: e.target.value as 'offen' | 'geschlossen' | 'stop' },
            },
          }))
        }
      >
        <option value="offen">Offen</option>
        <option value="geschlossen">Geschlossen</option>
        <option value="stop">Stop</option>
      </select>
    );
  }

  return (
    <select
      value={formData.action.state.on ? 'true' : 'false'}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          action: { ...prev.action, state: { on: e.target.value === 'true' } },
        }))
      }
    >
      <option value="true">Einschalten</option>
      <option value="false">Ausschalten</option>
    </select>
  );
};

export const RuleFormModal: React.FC<RuleFormModalProps> = ({
  editingId,
  formData,
  setFormData,
  groupedDevices,
  triggerDeviceType,
  actionDeviceType,
  onTriggerDeviceChange,
  onActionDeviceChange,
  onConditionFieldChange,
  onSave,
  onClose,
  saveError,
  conflicts,
}) => {
  const availableFields =
    FIELD_OPTIONS[triggerDeviceType] ?? [{ field: 'on' as ConditionField, label: 'Ein/Aus' }];
  const availableOperators =
    isBoolField(formData.condition.field) || isStringField(formData.condition.field)
      ? BOOL_OPERATORS
      : NUMERIC_OPERATORS;

  return (
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
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <p className="rule-section-header">Auslöser</p>

          <div className="form-group">
            <label>Gerät überwachen</label>
            <DeviceSelect
              value={formData.device_id}
              onChange={onTriggerDeviceChange}
              groupedDevices={groupedDevices}
            />
          </div>

          {formData.device_id && (
            <div className="form-row-half">
              <div className="form-group">
                <label>Eigenschaft</label>
                <select
                  value={formData.condition.field}
                  onChange={(e) => onConditionFieldChange(e.target.value as ConditionField)}
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
                    setFormData((prev) => ({
                      ...prev,
                      condition: { ...prev.condition, operator: e.target.value as TriggerOperator },
                    }))
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
              <ConditionValueInput formData={formData} setFormData={setFormData} />
            </div>
          )}

          <p className="rule-section-header">Aktion</p>

          <div className="form-group">
            <label>Ziel-Gerät</label>
            <DeviceSelect
              value={formData.action.device_id}
              onChange={onActionDeviceChange}
              groupedDevices={groupedDevices}
            />
          </div>

          {formData.action.device_id && (
            <div className="form-group">
              <label>Aktion</label>
              <ActionValueInput
                formData={formData}
                setFormData={setFormData}
                actionDeviceType={actionDeviceType}
              />
            </div>
          )}
        </div>

        {saveError && <p className="form-error">{saveError}</p>}

        {conflicts.length > 0 && (
          <div className="conflict-warning">
            <p className="conflict-warning-title">Konflikt erkannt</p>
            <ul className="conflict-warning-list">
              {conflicts.map((c, i) => <li key={i}>{c.message}</li>)}
            </ul>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-flat" onClick={onClose}>
            Abbrechen
          </button>
          <button className="btn-primary" onClick={onSave}>
            {conflicts.length > 0 ? 'Trotzdem speichern' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};
