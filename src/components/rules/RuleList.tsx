import React from 'react';
import { LucidePencil, LucideTrash2, LucideZap } from 'lucide-react';
import { FIELD_OPTIONS } from './ruleUtils';
import type { Rule, DeviceWithRoom, DeviceState } from '../../types';

type RuleListProps = {
  rules: Rule[];
  devices: DeviceWithRoom[];
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  onToggle: (rule: Rule) => void;
  canManage: (rule: Rule) => boolean;
};

const formatConditionSummary = (rule: Rule, devices: DeviceWithRoom[]): string => {
  const triggerDev = devices.find((d) => d.id === rule.device_id);
  const cond = rule.condition;
  if (!cond || !triggerDev) return '—';
  const fieldLabel =
    FIELD_OPTIONS[triggerDev.type]?.find((f) => f.field === cond.field)?.label ?? cond.field;
  return `${triggerDev.name} · ${fieldLabel} ${cond.operator} ${cond.value}`;
};

const formatActionSummary = (rule: Rule, devices: DeviceWithRoom[]): string => {
  const actionDev = devices.find((d) => d.id === rule.action?.device_id);
  const state: DeviceState = rule.action?.state ?? {};
  if (!actionDev) return '—';
  let stateText = '';
  if (state.on !== undefined)                stateText = state.on ? 'EIN' : 'AUS';
  else if (state.brightness !== undefined)   stateText = `${state.brightness}%`;
  else if (state.temperature !== undefined)  stateText = `${state.temperature}°C`;
  else if (state.position !== undefined)     stateText = String(state.position);
  return `${actionDev.name}: ${stateText}`;
};

export const RuleList = React.memo(({ rules, devices, onEdit, onDelete, onToggle, canManage }: RuleListProps) => {
  if (rules.length === 0) {
    return (
      <div style={{ opacity: 0.5, marginTop: 32, textAlign: 'center' }}>
        Noch keine Regeln angelegt.
      </div>
    );
  }

  return (
    <div className="schedules-grid">
      {rules.map((r) => (
        <div key={r.id} className="schedule-item-card">
          <div className="schedule-content">
            <div className="schedule-title-row">
              <span className="schedule-name">{r.name}</span>
              <span className="badge-room">
                {devices.find((d) => d.id === r.device_id)?.rooms?.name}
              </span>
              <span className={`room-rule-badge ${canManage(r) ? 'owner' : 'member'}`}>
                {canManage(r) ? 'Eigentümer' : 'Mitglied'}
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
            {canManage(r) && (
              <>
                <button className="action-btn edit-btn" onClick={() => onEdit(r)}>
                  <LucidePencil size={18} />
                </button>
                <button className="action-btn delete-btn" onClick={() => onDelete(r.id)}>
                  <LucideTrash2 size={18} />
                </button>
              </>
            )}
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
