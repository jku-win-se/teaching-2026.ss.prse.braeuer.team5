import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateCondition, ruleService } from "../services/ruleService";
import type { RuleCondition, DeviceState } from "../types";

const {
  mockSingle,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockFrom,
} = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
}));

const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  order: vi.fn(),
};

Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));

vi.mock("../config/supabaseClient", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: mockFrom,
  },
}));

vi.mock("../services/logService", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../customEvents/eventEmitter", () => ({
  eventBus: { emitChange: vi.fn().mockResolvedValue(undefined) },
}));


describe("evaluateCondition", () => {
  const state: DeviceState = { on: true, brightness: 75, temperature: 22.5 };

  it("== liefert true bei übereinstimmendem Wert", () => {
    const cond: RuleCondition = { field: 'on', operator: '==', value: true };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("== liefert false bei abweichendem Wert", () => {
    const cond: RuleCondition = { field: 'on', operator: '==', value: false };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it("!= liefert true wenn Werte unterschiedlich sind", () => {
    const cond: RuleCondition = { field: 'brightness', operator: '!=', value: 100 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("> liefert true wenn aktueller Wert größer ist", () => {
    const cond: RuleCondition = { field: 'temperature', operator: '>', value: 20 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("> liefert false wenn aktueller Wert kleiner ist", () => {
    const cond: RuleCondition = { field: 'temperature', operator: '>', value: 25 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it(">= liefert true bei exakter Gleichheit", () => {
    const cond: RuleCondition = { field: 'temperature', operator: '>=', value: 22.5 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("< liefert true wenn aktueller Wert kleiner ist", () => {
    const cond: RuleCondition = { field: 'brightness', operator: '<', value: 80 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("<= liefert true bei exakter Gleichheit", () => {
    const cond: RuleCondition = { field: 'brightness', operator: '<=', value: 75 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it("gibt false zurück wenn Feld fehlt", () => {
    const cond: RuleCondition = { field: 'position', operator: '==', value: 'offen' };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it("gibt false zurück für leeres State-Objekt", () => {
    const cond: RuleCondition = { field: 'on', operator: '==', value: true };
    expect(evaluateCondition(cond, {})).toBe(false);
  });
});

describe("ruleService CRUD", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));
    mockFrom.mockReturnValue(chainable);
  });

  describe("fetchAllRules", () => {
    it("gibt Regeln zurück wenn Supabase Daten liefert", async () => {
      const rules = [{ id: "r1", name: "Regel 1", is_active: true }];
      chainable.order.mockResolvedValueOnce({ data: rules, error: null });

      const result = await ruleService.fetchAllRules();
      expect(result).toEqual(rules);
    });

    it("gibt leeres Array zurück bei Fehler", async () => {
      chainable.order.mockResolvedValueOnce({ data: null, error: { message: "Fehler" } });

      await expect(ruleService.fetchAllRules()).rejects.toThrow();
    });
  });

  describe("createRule", () => {
    it("legt neue Regel an und gibt Daten zurück", async () => {
      const newRule = { id: "new-1", name: "Neue Regel" };
      mockSelect.mockResolvedValueOnce({ data: [newRule], error: null });

      const payload = {
        name: "Neue Regel",
        room_id: "room-1",
        device_id: "dev-1",
        condition: { field: 'temperature', operator: '>', value: 25 },
        action: { device_id: "dev-2", state: { on: false } },
        cooldown_minutes: 1,
      };
      const result = await ruleService.createRule(payload);
      expect(result).toEqual([newRule]);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "Neue Regel", is_active: true, cooldown_minutes: 1 }),
        ])
      );
    });
  });

  describe("toggleRule", () => {
    it("aktualisiert is_active auf false", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await ruleService.toggleRule("rule-1", false);
      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
    });
  });

  describe("deleteRule", () => {
    it("löscht die Regel ohne Fehler", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await expect(ruleService.deleteRule("rule-1")).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});

describe("checkAndExecuteRules", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Object.values(chainable).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable));
    mockFrom.mockReturnValue(chainable);
  });

  it("führt Regel aus wenn Bedingung erfüllt und Cooldown abgelaufen", async () => {
    const rule = {
      id: "rule-1",
      name: "Heiß-Regel",
      room_id: "room-1",
      device_id: "trigger-dev",
      condition: { field: 'temperature', operator: '>', value: 24 },
      action: { device_id: "action-dev", state: { on: false } },
      is_active: true,
      cooldown_minutes: 5,
      last_triggered_at: null,
    };

    // 1. .from('rules').select('*').eq('is_active', true) → data
    mockEq.mockResolvedValueOnce({ data: [rule], error: null });
    // 2. .from('devices').select('state, room_id').eq('id', ...) → chainable (default), then .single() → data
    mockSingle.mockResolvedValueOnce({ data: { state: { temperature: 26 }, room_id: 'room-1' }, error: null });
    // 3. .from('devices').update({state}).eq('id', ...) → chainable default (error: undefined → falsy)
    // 4. .from('rules').update({last_triggered_at}).eq('id', ...) → chainable default

    await ruleService.checkAndExecuteRules();

    expect(mockUpdate).toHaveBeenCalledWith({ state: { on: false } });
  });

  it("überspringt Regel wenn Cooldown noch nicht abgelaufen", async () => {
    const recentlyTriggered = new Date(Date.now() - 30_000).toISOString(); // 30 Sek ago
    const rule = {
      id: "rule-1",
      name: "Regel mit Cooldown",
      device_id: "trigger-dev",
      condition: { field: 'on', operator: '==', value: true },
      action: { device_id: "action-dev", state: { on: false } },
      is_active: true,
      cooldown_minutes: 1,
      last_triggered_at: recentlyTriggered,
    };

    mockEq.mockResolvedValueOnce({ data: [rule], error: null });

    await ruleService.checkAndExecuteRules();

    // update für Aktion darf NICHT aufgerufen worden sein
    expect(mockUpdate).not.toHaveBeenCalledWith({ state: { on: false } });
  });

  it("überspringt Regel wenn Bedingung nicht erfüllt", async () => {
    const rule = {
      id: "rule-1",
      name: "Kalte Regel",
      device_id: "trigger-dev",
      condition: { field: 'temperature', operator: '>', value: 30 },
      action: { device_id: "action-dev", state: { on: true } },
      is_active: true,
      cooldown_minutes: 5,
      last_triggered_at: null,
    };

    mockEq.mockResolvedValueOnce({ data: [rule], error: null });
    mockSingle.mockResolvedValueOnce({ data: { state: { temperature: 20 }, room_id: 'room-1' }, error: null });

    await ruleService.checkAndExecuteRules();

    expect(mockUpdate).not.toHaveBeenCalledWith({ state: { on: true } });
  });
});
