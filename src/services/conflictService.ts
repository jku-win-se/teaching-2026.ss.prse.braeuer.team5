import type { DeviceState, Rule, RuleCondition, Schedule, Conflict } from '../types';

/**
 * Prüft, ob zwei {@link DeviceState}-Objekte widersprüchliche Felder enthalten.
 * Ein Widerspruch liegt vor, wenn beide denselben Feldnamen belegen,
 * aber unterschiedliche Werte setzen.
 * @param a - Erster Zustand.
 * @param b - Zweiter Zustand.
 * @returns `true` wenn mindestens ein Feld widersprüchlich ist.
 */
function statesConflict(a: DeviceState, b: DeviceState): boolean {
  const fields: (keyof DeviceState)[] = ['on', 'brightness', 'temperature', 'value', 'position'];

  for (const field of fields) {
    const valA = a[field];
    const valB = b[field];
    if (valA !== undefined && valB !== undefined && valA !== valB) {
      return true;
    }
  }
  return false;
}

/**
 * Numerisches Intervall mit offenen/geschlossenen Grenzen.
 * min/max = ±Infinity bedeutet „unbegrenzt".
 */
interface Interval {
  min: number;
  max: number;
  minInclusive: boolean;
  maxInclusive: boolean;
}

/**
 * Konvertiert eine {@link RuleCondition} in ein numerisches {@link Interval}.
 * @param cond - Die zu konvertierende Bedingung (muss numerischen Wert haben).
 * @returns Intervall oder `null` wenn keine Konvertierung möglich ist.
 */
function conditionToInterval(cond: RuleCondition): Interval | null {
  if (typeof cond.value !== 'number') return null;
  const v = cond.value;
  switch (cond.operator) {
    case '>':  return { min: v, max: Infinity, minInclusive: false, maxInclusive: true };
    case '>=': return { min: v, max: Infinity, minInclusive: true,  maxInclusive: true };
    case '<':  return { min: -Infinity, max: v, minInclusive: true, maxInclusive: false };
    case '<=': return { min: -Infinity, max: v, minInclusive: true, maxInclusive: true };
    case '==': return { min: v, max: v, minInclusive: true,  maxInclusive: true };
    case '!=': return null; // separat behandeln
    default:   return null;
  }
}

/**
 * Prüft, ob sich zwei numerische Intervalle überlappen
 * (d. h. es existiert ein Wert, der in beiden liegt).
 */
function intervalsOverlap(a: Interval, b: Interval): boolean {
  if (a.max < b.min) return false;
  if (a.max === b.min && !(a.maxInclusive && b.minInclusive)) return false;
  if (b.max < a.min) return false;
  if (b.max === a.min && !(b.maxInclusive && a.minInclusive)) return false;
  return true;
}

/**
 * Können zwei Bedingungen gleichzeitig wahr sein?
 * Für numerische Bedingungen: Intervall-Überschneidung.
 * Für boolesche/String-Bedingungen: Wertvergleich.
 * @param a - Erste Bedingung.
 * @param b - Zweite Bedingung.
 * @returns `true` wenn beide Bedingungen gleichzeitig erfüllt sein können.
 */
function conditionsCanCoincide(a: RuleCondition, b: RuleCondition): boolean {
  if (a.field !== b.field) return false;

  if (typeof a.value === 'number' && typeof b.value === 'number') {
    if (a.operator === '!=' && b.operator === '!=') return true;

    if (a.operator === '!=' && b.operator === '==') {
      return a.value !== b.value;
    }

    const iA = conditionToInterval(a);
    const iB = conditionToInterval(b);
    if (!iA || !iB) return true;
    return intervalsOverlap(iA, iB);
  }

  // Nicht-numerisch (bool, string)
  if (a.operator === '==' && b.operator === '==') return a.value === b.value;
  if (a.operator === '!=' && b.operator === '!=') return true;
  if (a.operator === '==' && b.operator === '!=') return a.value !== b.value;
  if (a.operator === '!=' && b.operator === '==') return a.value !== b.value;

  return true;
}

/**
 * Prüft, ob zwei Regel-Trigger (Auslöser-Gerät + Bedingung) gleichzeitig ausgelöst
 * werden können, indem Gerät und Bedingung verglichen werden.
 * @param aDeviceId - Auslöser-Gerät der ersten Regel.
 * @param aCond - Bedingung der ersten Regel.
 * @param bDeviceId - Auslöser-Gerät der zweiten Regel.
 * @param bCond - Bedingung der zweiten Regel.
 * @returns `true` wenn beide gleichzeitig ausgelöst werden können.
 */
function triggersCanCoincide(
  aDeviceId: string,
  aCond: RuleCondition,
  bDeviceId: string,
  bCond: RuleCondition
): boolean {
  if (aDeviceId !== bDeviceId) {
    return false;
  }
  return conditionsCanCoincide(aCond, bCond);
}

/**
 * Erkennt Konflikte zwischen einer neuen Regel und bestehenden Regeln/Zeitplänen.
 *
 * Ein Konflikt (Typ `rule-rule`) liegt vor, wenn:
 * - beide Regeln dasselbe Zielgerät steuern,
 * - ihre Trigger gleichzeitig ausgelöst werden können,
 * - und die Zielzustände widersprüchlich sind.
 *
 * Ein Konflikt (Typ `rule-schedule`) liegt vor, wenn:
 * - ein Zeitplan dasselbe Zielgerät mit widersprüchlichem Zustand steuert.
 *
 * @param candidate - Die zu prüfende (neue oder bearbeitete) Regel.
 * @param existingRules - Alle vorhandenen Regeln (wird nach `id` des Kandidaten gefiltert).
 * @param schedules - Alle vorhandenen Zeitpläne.
 * @returns Array von {@link Conflict}-Objekten (leer = kein Konflikt).
 */
export function detectRuleConflicts(
  candidate: {
    id?: string;
    device_id: string;
    condition: RuleCondition;
    action: { device_id: string; state: DeviceState };
  },
  existingRules: Rule[],
  schedules: Schedule[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const targetDeviceId = candidate.action.device_id;
  if (!targetDeviceId) return conflicts;

  for (const rule of existingRules) {
    if (rule.id === candidate.id) continue;
    if (!rule.is_active) continue;

    console.log(`Prüfe Regel „${rule.name}" gegen Kandidat: Bedingung ${rule.action.device_id === targetDeviceId}
      triggersCanCoincide ${triggersCanCoincide(rule.device_id, rule.condition, candidate.device_id, candidate.condition)}
      statesConflict ${statesConflict(rule.action.state, candidate.action.state)}`);

    if (
      rule.action.device_id === targetDeviceId &&
      triggersCanCoincide(rule.device_id, rule.condition, candidate.device_id, candidate.condition) &&
      statesConflict(rule.action.state, candidate.action.state)
    ) {
      conflicts.push({
        type: 'rule-rule',
        message: `Konflikt mit Regel „${rule.name}": beide Regeln können gleichzeitig auslösen und steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: rule.name,
      });
    }
  }

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;
    if (
      schedule.device_id === targetDeviceId &&
      statesConflict(schedule.action_value, candidate.action.state)
    ) {
      conflicts.push({
        type: 'rule-schedule',
        message: `Konflikt mit Zeitplan „${schedule.name}": Regel und Zeitplan steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: schedule.name,
      });
    }
  }

  return conflicts;
}

/**
 * Erkennt Konflikte zwischen einem neuen Zeitplan und bestehenden Zeitplänen/Regeln.
 *
 * Ein Konflikt (Typ `schedule-schedule`) liegt vor, wenn:
 * - zwei Zeitpläne dasselbe Gerät zur selben Zeit an denselben Tagen steuern,
 * - und die Zielzustände widersprüchlich sind.
 *
 * Ein Konflikt (Typ `rule-schedule`) liegt vor, wenn:
 * - eine Regel dasselbe Zielgerät mit widersprüchlichem Zustand steuert.
 *
 * @param candidate - Der zu prüfende (neue oder bearbeitete) Zeitplan.
 * @param existingSchedules - Alle vorhandenen Zeitpläne (wird nach `id` gefiltert).
 * @param rules - Alle vorhandenen Regeln.
 * @returns Array von {@link Conflict}-Objekten (leer = kein Konflikt).
 */
export function detectScheduleConflicts(
  candidate: {
    id?: string;
    device_id: string;
    time: string;
    days: number[];
    action_value: DeviceState;
  },
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
    if (
      rule.action.device_id === candidate.device_id &&
      statesConflict(rule.action.state, candidate.action_value)
    ) {
      conflicts.push({
        type: 'rule-schedule',
        message: `Konflikt mit Regel „${rule.name}": Zeitplan und Regel steuern dasselbe Gerät mit widersprüchlichem Zustand.`,
        conflictingItemName: rule.name,
      });
    }
  }

  return conflicts;
}
