import type { DeviceState, Rule, Schedule, Conflict } from '../types';

function statesConflict(a: DeviceState, b: DeviceState): boolean {
  const fields: (keyof DeviceState)[] = ['on', 'brightness', 'temperature', 'value', 'position'];
  return fields.some(
    (field) => a[field] !== undefined && b[field] !== undefined && a[field] !== b[field]
  );
}

export function detectRuleConflicts(
  candidate: { id?: string; action: { device_id: string; state: DeviceState } },
  existingRules: Rule[],
  schedules: Schedule[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const targetDeviceId = candidate.action.device_id;
  if (!targetDeviceId) return conflicts;

  for (const rule of existingRules) {
    if (rule.id === candidate.id) continue;
    if (!rule.is_active) continue;
    if (rule.action.device_id === targetDeviceId && statesConflict(rule.action.state, candidate.action.state)) {
      conflicts.push({
        type: 'rule-rule',
        message: `Konflikt mit Regel „${rule.name}": beide Regeln steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: rule.name,
      });
    }
  }

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;
    if (schedule.device_id === targetDeviceId && statesConflict(schedule.action_value, candidate.action.state)) {
      conflicts.push({
        type: 'rule-schedule',
        message: `Konflikt mit Zeitplan „${schedule.name}": Regel und Zeitplan steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: schedule.name,
      });
    }
  }

  return conflicts;
}

export function detectScheduleConflicts(
  candidate: { id?: string; device_id: string; time: string; days: number[]; action_value: DeviceState },
  existingSchedules: Schedule[],
  rules: Rule[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  if (!candidate.device_id) return conflicts;

  const candidateTime = candidate.time.substring(0, 5);

  for (const schedule of existingSchedules) {
    if (schedule.id === candidate.id) continue;
    if (!schedule.is_active) continue;
    if (
      schedule.device_id === candidate.device_id &&
      schedule.time.substring(0, 5) === candidateTime &&
      schedule.days.some((d) => candidate.days.includes(d)) &&
      statesConflict(schedule.action_value, candidate.action_value)
    ) {
      conflicts.push({
        type: 'schedule-schedule',
        message: `Konflikt mit Zeitplan „${schedule.name}": beide Zeitpläne laufen zur selben Zeit auf demselben Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: schedule.name,
      });
    }
  }

  for (const rule of rules) {
    if (!rule.is_active) continue;
    if (rule.action.device_id === candidate.device_id && statesConflict(rule.action.state, candidate.action_value)) {
      conflicts.push({
        type: 'rule-schedule',
        message: `Konflikt mit Regel „${rule.name}": Zeitplan und Regel steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: rule.name,
      });
    }
  }

  return conflicts;
}
