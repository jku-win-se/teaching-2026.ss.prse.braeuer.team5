import { describe, it, expect } from 'vitest';
import { detectRuleConflicts, detectScheduleConflicts } from '../services/conflictService';
import type { Rule, Schedule } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeRule = (overrides: Partial<Rule> = {}): Rule => ({
  id: 'rule-1',
  name: 'Testregel',
  device_id: 'device-trigger',
  condition: { field: 'on', operator: '==', value: true },
  action: { device_id: 'device-target', state: { on: true } },
  is_active: true,
  cool_down_ms: 500,
  ...overrides,
});

const makeSchedule = (overrides: Partial<Schedule> = {}): Schedule => ({
  id: 'sched-1',
  name: 'Testzeitplan',
  room_id: 'room-1',
  device_id: 'device-target',
  time: '08:00:00',
  days: [1, 2],
  action_value: { on: true },
  is_active: true,
  ...overrides,
});

// ─── detectRuleConflicts ──────────────────────────────────────────────────────

describe('detectRuleConflicts', () => {
  it('gibt keinen Konflikt zurück wenn keine bestehenden Regeln vorhanden', () => {
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [], [])).toEqual([]);
  });

  it('erkennt Regel-Regel-Konflikt bei gleichem Zielgerät und widersprüchlichem on-Wert', () => {
    const existing = makeRule({ id: 'rule-1', action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    const result = detectRuleConflicts(candidate, [existing], []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('rule-rule');
    expect(result[0].conflictingItemName).toBe('Testregel');
  });

  it('gibt keinen Konflikt zurück wenn Zielgerät unterschiedlich', () => {
    const existing = makeRule({ action: { device_id: 'device-other', state: { on: true } } });
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('gibt keinen Konflikt zurück wenn beide Regeln denselben Zustand setzen', () => {
    const existing = makeRule({ action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { action: { device_id: 'device-target', state: { on: true } } };
    expect(detectRuleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('ignoriert inaktive Regeln', () => {
    const existing = makeRule({ is_active: false, action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('ignoriert die eigene Regel beim Bearbeiten (selbe id)', () => {
    const existing = makeRule({ id: 'rule-edit', action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { id: 'rule-edit', action: { device_id: 'device-target', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('erkennt Regel-Zeitplan-Konflikt bei gleichem Zielgerät und widersprüchlichem Zustand', () => {
    const schedule = makeSchedule({ device_id: 'device-target', action_value: { on: true } });
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    const result = detectRuleConflicts(candidate, [], [schedule]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('rule-schedule');
    expect(result[0].conflictingItemName).toBe('Testzeitplan');
  });

  it('ignoriert inaktive Zeitpläne bei Regel-Zeitplan-Prüfung', () => {
    const schedule = makeSchedule({ is_active: false, action_value: { on: true } });
    const candidate = { action: { device_id: 'device-target', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [], [schedule])).toEqual([]);
  });

  it('gibt keinen Konflikt zurück wenn kein Zielgerät gesetzt', () => {
    const existing = makeRule();
    const candidate = { action: { device_id: '', state: { on: false } } };
    expect(detectRuleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('erkennt Konflikt bei numerischem Feld (temperature)', () => {
    const existing = makeRule({ action: { device_id: 'device-target', state: { temperature: 20 } } });
    const candidate = { action: { device_id: 'device-target', state: { temperature: 25 } } };
    const result = detectRuleConflicts(candidate, [existing], []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('rule-rule');
  });
});

// ─── detectScheduleConflicts ─────────────────────────────────────────────────

describe('detectScheduleConflicts', () => {
  it('gibt keinen Konflikt zurück wenn keine bestehenden Zeitpläne vorhanden', () => {
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [], [])).toEqual([]);
  });

  it('erkennt Zeitplan-Zeitplan-Konflikt bei gleichem Gerät, Zeit, Wochentag und widersprüchlichem Zustand', () => {
    const existing = makeSchedule({ action_value: { on: true } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    const result = detectScheduleConflicts(candidate, [existing], []);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('schedule-schedule');
    expect(result[0].conflictingItemName).toBe('Testzeitplan');
  });

  it('gibt keinen Konflikt zurück wenn Wochentage nicht überlappen', () => {
    const existing = makeSchedule({ days: [3, 4], action_value: { on: true } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1, 2], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('gibt keinen Konflikt zurück wenn Zeiten unterschiedlich sind', () => {
    const existing = makeSchedule({ time: '10:00:00', action_value: { on: true } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('gibt keinen Konflikt zurück wenn Gerät unterschiedlich', () => {
    const existing = makeSchedule({ device_id: 'device-other', action_value: { on: true } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('ignoriert inaktive Zeitpläne', () => {
    const existing = makeSchedule({ is_active: false, action_value: { on: true } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('ignoriert den eigenen Zeitplan beim Bearbeiten (selbe id)', () => {
    const existing = makeSchedule({ id: 'sched-edit', action_value: { on: true } });
    const candidate = { id: 'sched-edit', device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });

  it('erkennt Regel-Zeitplan-Konflikt wenn Regel dasselbe Gerät mit widersprüchlichem Zustand steuert', () => {
    const rule = makeRule({ action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    const result = detectScheduleConflicts(candidate, [], [rule]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('rule-schedule');
    expect(result[0].conflictingItemName).toBe('Testregel');
  });

  it('ignoriert inaktive Regeln bei Regel-Zeitplan-Prüfung', () => {
    const rule = makeRule({ is_active: false, action: { device_id: 'device-target', state: { on: true } } });
    const candidate = { device_id: 'device-target', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [], [rule])).toEqual([]);
  });

  it('gibt keinen Konflikt zurück wenn kein Zielgerät gesetzt', () => {
    const existing = makeSchedule();
    const candidate = { device_id: '', time: '08:00', days: [1], action_value: { on: false } };
    expect(detectScheduleConflicts(candidate, [existing], [])).toEqual([]);
  });
});
