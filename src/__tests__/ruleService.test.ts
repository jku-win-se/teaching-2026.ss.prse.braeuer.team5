import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateCondition, ruleService } from "../services/ruleService";
import type { RuleCondition, DeviceState } from "../types";

// ─────────────────────────────────────────────────────────────
// MOCK-SETUP
// ─────────────────────────────────────────────────────────────
// vi.hoisted sorgt dafür, dass die Mocks VOR dem vi.mock-Aufruf
// existieren. Notwendig, weil vi.mock() ans Top der Datei gehoisted
// wird und sonst auf undefinierte Variablen zugreifen würde.
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

// Das chainable-Objekt simuliert den Supabase Query-Builder.
// Jede Methode (select, eq, update, ...) gibt standardmäßig
// wieder das chainable Objekt zurück, sodass beliebige
// Verkettungen wie .from().select().eq().eq() funktionieren.
const chainable = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
  order: vi.fn(),
};

// Default-Verhalten: alle Methoden geben das chainable zurück.
// Wird in beforeEach() vor jedem Test wieder gesetzt, weil
// vi.resetAllMocks() das Verhalten zurücksetzt.
Object.values(chainable).forEach(
  (fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable)
);

// Supabase-Client mocken: from() liefert immer das chainable.
vi.mock("../config/supabaseClient", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: mockFrom,
  },
}));

// Hilfs-Services mocken, damit der Test sie nicht real ausführt.
vi.mock("../services/logService", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../customEvents/eventEmitter", () => ({
  eventBus: { emitChange: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../customEvents/ruleNotifier", () => ({
  ruleNotifier: { emit: vi.fn() },
}));


// ─────────────────────────────────────────────────────────────
// evaluateCondition – reine Funktion, kein Supabase-Mock nötig
// ─────────────────────────────────────────────────────────────
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


// ─────────────────────────────────────────────────────────────
// ruleService CRUD-Operationen
// ─────────────────────────────────────────────────────────────
describe("ruleService CRUD", () => {
  beforeEach(() => {
    // Vor jedem Test alle Mock-Verläufe zurücksetzen
    vi.resetAllMocks();
    // Default-Chaining-Verhalten wiederherstellen
    Object.values(chainable).forEach(
      (fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable)
    );
    mockFrom.mockReturnValue(chainable);
  });

  describe("fetchAllRules", () => {
    it("gibt Regeln zurück wenn Supabase Daten liefert", async () => {
      const rules = [{ id: "r1", name: "Regel 1", is_active: true }];
      // .order() ist die letzte Methode in der Kette und resolved direkt
      chainable.order.mockResolvedValueOnce({ data: rules, error: null });

      const result = await ruleService.fetchAllRules();
      expect(result).toEqual(rules);
    });

    it("gibt leeres Array zurück bei Fehler", async () => {
      chainable.order.mockResolvedValueOnce({ data: null, error: { message: "Fehler" } });

      // Service wirft im Fehlerfall – also rejects erwarten
      await expect(ruleService.fetchAllRules()).rejects.toThrow();
    });
  });

  describe("createRule", () => {
    it("legt neue Regel an und gibt Daten zurück", async () => {
      const newRule = { id: "new-1", name: "Neue Regel" };
      // Kette: .insert([...]).select() → .select() ist der Endpunkt
      mockSelect.mockResolvedValueOnce({ data: [newRule], error: null });

      const payload = {
        name: "Neue Regel",
        room_id: "room-1",
        device_id: "dev-1",
        condition: { field: 'temperature', operator: '>', value: 25 },
        action: { device_id: "dev-2", state: { on: false } },
        cool_down_ms: 200,
      };
      const result = await ruleService.createRule(payload);
      expect(result).toEqual([newRule]);

      // FIX: Service schreibt cool_down_ms (nicht cooldown_minutes)
      // und der Default-Wert im Service ist 500
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Neue Regel",
            is_active: true,
            cool_down_ms: 500,
          }),
        ])
      );
    });
  });

  describe("toggleRule", () => {
    it("aktualisiert is_active auf false", async () => {
      // .update().eq() – das letzte .eq() resolved
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


// ─────────────────────────────────────────────────────────────
// checkAndExecuteRulesForDevice – komplexere Mock-Ketten
// ─────────────────────────────────────────────────────────────
//
// Die Methode macht mehrere verkettete .eq()-Aufrufe:
//   1. rules.select('*').eq('is_active', true).eq('device_id', x)
//        → ZWEI .eq() hintereinander, das zweite resolved
//   2. devices.select('state, room_id').eq('id', x).single()
//        → .eq() chainbar, .single() resolved
//   3. devices.update({state}).eq('id', x)
//        → .eq() resolved
//   4. rules.update({last_triggered_at}).eq('id', x)
//        → .eq() resolved
//
// WICHTIG: mockEq wird mehrfach hintereinander aufgerufen.
// Wir nutzen mockReturnValueOnce(chainable) für Aufrufe, die
// noch chainbar bleiben sollen, und mockResolvedValueOnce(...)
// nur für den letzten .eq()-Aufruf einer Kette.
// ─────────────────────────────────────────────────────────────
describe("checkAndExecuteRules", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Object.values(chainable).forEach(
      (fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chainable)
    );
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
      cool_down_ms: 200,
      last_triggered_at: null, // Cooldown garantiert abgelaufen
    };

    // Reihenfolge der mockEq-Aufrufe entspricht der Reihenfolge im Service:
    mockEq
      // 1. rules.select.eq('is_active', true) – muss chainbar bleiben für nächstes .eq()
      .mockReturnValueOnce(chainable)
      // 2. .eq('device_id', deviceId) – Endpunkt der Kette, liefert die Regeln
      .mockResolvedValueOnce({ data: [rule], error: null })
      // 3. devices.select.eq('id', ...) – chainbar für nachfolgendes .single()
      .mockReturnValueOnce(chainable)
      // 4. devices.update.eq('id', ...) – Endpunkt, kein Fehler
      .mockResolvedValueOnce({ error: null })
      // 5. rules.update.eq('id', ...) – Endpunkt, kein Fehler
      .mockResolvedValueOnce({ error: null });

    // .single() liefert das Trigger-Device mit Temperatur 26 (> 24, Bedingung erfüllt)
    mockSingle.mockResolvedValueOnce({
      data: { state: { temperature: 26 }, room_id: 'room-1' },
      error: null,
    });

    await ruleService.checkAndExecuteRulesForDevice("trigger-dev");

    // Erwartung: Service hat das action-Device mit state {on: false} aktualisiert
    expect(mockUpdate).toHaveBeenCalledWith({ state: { on: false } });
  });

  it("überspringt Regel wenn Cooldown noch nicht abgelaufen", async () => {
    // FIX: 50ms vor jetzt – kürzer als cool_down_ms (200ms),
    // d.h. Cooldown ist NOCH aktiv. (Vorher waren es 30 Sekunden,
    // was länger als 200ms ist und den Cooldown abgelaufen lassen würde.)
    const recentlyTriggered = new Date(Date.now() - 50).toISOString();

    const rule = {
      id: "rule-1",
      name: "Regel mit Cooldown",
      device_id: "trigger-dev",
      condition: { field: 'on', operator: '==', value: true },
      action: { device_id: "action-dev", state: { on: false } },
      is_active: true,
      cool_down_ms: 200,
      last_triggered_at: recentlyTriggered,
    };

    // Nur die rules-Abfrage ist nötig – der Service bricht wegen Cooldown
    // VOR dem devices-Fetch ab. Also nur zwei .eq()-Aufrufe.
    mockEq
      .mockReturnValueOnce(chainable)                            // is_active eq
      .mockResolvedValueOnce({ data: [rule], error: null });     // device_id eq → Daten

    await ruleService.checkAndExecuteRulesForDevice("trigger-dev");

    // update für die Aktion darf NICHT aufgerufen worden sein
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
      cool_down_ms: 200,
      last_triggered_at: null, // Cooldown abgelaufen, damit die Bedingungsprüfung erreicht wird
    };

    mockEq
      .mockReturnValueOnce(chainable)                            // is_active eq
      .mockResolvedValueOnce({ data: [rule], error: null })      // device_id eq → Daten
      .mockReturnValueOnce(chainable);                           // devices eq → chainbar für .single()

    // Trigger-Device hat Temperatur 20, Bedingung verlangt > 30 → nicht erfüllt
    mockSingle.mockResolvedValueOnce({
      data: { state: { temperature: 20 }, room_id: 'room-1' },
      error: null,
    });

    await ruleService.checkAndExecuteRulesForDevice("trigger-dev");

    // Action-Update darf nicht passiert sein, weil Bedingung false war
    expect(mockUpdate).not.toHaveBeenCalledWith({ state: { on: true } });
  });
});