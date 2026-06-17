import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { ruleNotifier } from "../customEvents/ruleNotifier";
import type { RuleCondition, DeviceState, Rule, RuleAction } from "../types";

/** Interne Payload-Struktur für Create/Update-Operationen. */
type RulePayload = {
  name: string;
  room_id?: string;
  device_id: string;
  condition: { field: string; operator: string; value: boolean | number | string };
  action: RuleAction;
};

/**
 * Erzeugt einen lesbaren Log-Text für eine ausgeführte Regelaktion.
 * @param state - Zielzustand, der durch die Regel gesetzt wurde.
 * @param ruleName - Name der Regel.
 * @returns Formatierter Beschreibungstext.
 */
const getActionText = (state: DeviceState, ruleName: string): string => {
  let detail = '';
  if (state.on !== undefined) {
    detail = state.on ? 'EIN' : 'AUS';
  } else if (state.brightness !== undefined) {
    detail = `${state.brightness}%`;
  } else if (state.temperature !== undefined) {
    detail = `${state.temperature}°C`;
  } else if (state.position !== undefined) {
    detail = `Position ${state.position}`;
  } else {
    detail = JSON.stringify(state);
  }
  return `Automatisch ${detail} durch Regel "${ruleName}"`;
};

/**
 * Wertet eine Regel-Bedingung gegen den aktuellen Gerätezustand aus.
 * Unterstützt alle {@link TriggerOperator}-Werte: `==`, `!=`, `>`, `>=`, `<`, `<=`.
 * @param cond - Die zu prüfende Bedingung.
 * @param state - Aktueller Gerätezustand.
 * @returns `true` wenn die Bedingung erfüllt ist, sonst `false`.
 */
export function evaluateCondition(cond: RuleCondition, state: DeviceState): boolean {
  const current = state[cond.field];
  if (current === undefined) return false;
  switch (cond.operator) {
    case '==': return current == cond.value;
    case '!=': return current != cond.value;
    case '>':  return Number(current) >  Number(cond.value);
    case '>=': return Number(current) >= Number(cond.value);
    case '<':  return Number(current) <  Number(cond.value);
    case '<=': return Number(current) <= Number(cond.value);
    default:   return false;
  }
}

/**
 * Prüft, ob seit der letzten Auslösung ausreichend Zeit vergangen ist.
 * @param lastTriggeredAt - ISO-Zeitstempel der letzten Ausführung (oder null).
 * @param cooldownMs - Mindestabstand in Millisekunden.
 * @returns `true` wenn der Cooldown abgelaufen ist.
 */
function cooldownElapsed(lastTriggeredAt: string | null | undefined, cooldownMs: number): boolean {
  if (!lastTriggeredAt) return true;
  const elapsed = (Date.now() - new Date(lastTriggeredAt).getTime());
  return elapsed >= cooldownMs;
}

/** Service-Objekt für alle Regel-Operationen (CRUD + Regelausführung). */
export const ruleService = {

  /**
   * Lädt alle Regeln, die einem bestimmten Gerät als Auslöser zugeordnet sind.
   * @param deviceId - UUID des Auslöser-Geräts.
   * @returns Array von {@link Rule}-Objekten oder leeres Array.
   */
  async getRulesForDevice(deviceId: string): Promise<Rule[] | []> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('device_id', deviceId);
    if (error) throw error;
    return data as Rule[] || [];
  },

  /**
   * Lädt alle Regeln absteigend nach Erstellungsdatum.
   * @returns Array von {@link Rule}-Objekten oder leeres Array.
   */
  async fetchAllRules() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Erstellt eine neue Regel mit Standard-Cooldown von 500 ms.
   * Die Regel wird sofort aktiviert (`is_active: true`).
   * @param payload - Regelkonfiguration (Name, Gerät, Bedingung, Aktion).
   * @returns Die erstellten Datenbankzeilen oder `null`.
   */
  async createRule(payload: RulePayload) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('rules')
      .insert([{
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        condition: payload.condition,
        action: payload.action,
        is_active: true,
        last_triggered_at: null,
        cool_down_ms: 500,
      }])
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Aktualisiert eine bestehende Regel.
   * @param id - UUID der Regel.
   * @param payload - Neue Regelkonfiguration.
   * @returns Die aktualisierten Datenbankzeilen oder `null`.
   */
  async updateRule(id: string, payload: RulePayload) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('rules')
      .update({
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        condition: payload.condition,
        action: payload.action,
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Schaltet den Aktiv-Status einer Regel um.
   * @param id - UUID der Regel.
   * @param is_active - Neuer Aktiv-Status.
   */
  async toggleRule(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from('rules')
      .update({ is_active })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Löscht eine Regel unwiderruflich.
   * @param id - UUID der Regel.
   */
  async deleteRule(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Prüft und führt alle aktiven Regeln aus, die durch eine Zustandsänderung
   * des angegebenen Geräts ausgelöst werden könnten.
   *
   * Ablauf pro Regel:
   * 1. Cooldown-Prüfung (`cool_down_ms`)
   * 2. Zustand des Auslöser-Geräts laden
   * 3. Bedingung mit {@link evaluateCondition} prüfen
   * 4. Ziel-Gerät aktualisieren und `last_triggered_at` setzen
   * 5. {@link ruleNotifier} emittiert den Regelnamen (für UI-Overlay)
   * 6. Aktivitäts-Log-Eintrag schreiben
   *
   * @param deviceId - UUID des Geräts, das seinen Zustand geändert hat.
   */
  async checkAndExecuteRulesForDevice(deviceId: string) {
    if (!supabase) return;

    const { data: activeRules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true)
      .eq('device_id', deviceId);

    if (error || !activeRules || activeRules.length === 0) return;

    for (const rule of activeRules) {
      try {

        if(!cooldownElapsed(rule.last_triggered_at, rule.cool_down_ms)) {
          continue;
        }

        const { data: triggerDevice } = await supabase
          .from('devices')
          .select('state, room_id')
          .eq('id', rule.device_id)
          .single();

        if (!triggerDevice) continue;

        const conditionMet = evaluateCondition(rule.condition, triggerDevice.state ?? {});
        if (!conditionMet) continue;

        ruleNotifier.emit(rule.name);

        const { error: deviceError } = await supabase
          .from('devices')
          .update({ state: rule.action.state })
          .eq('id', rule.action.device_id);

        if (deviceError) {
          console.error(`[RuleEngine] Fehler bei "${rule.name}":`, deviceError.message);
          continue;
        }

        await supabase
          .from('rules')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', rule.id);

        const roomId: string = rule.room_id ?? triggerDevice.room_id;
        const logText = getActionText(rule.action.state, rule.name);

        await logAction({
          room_id: roomId,
          device_id: rule.action.device_id,
          action: 'Regel ausgeführt',
          new_value: logText,
          actor_type: 'automation',
          user_id: undefined,
        });

      } catch (err) {
        console.error(`[RuleEngine] Unerwarteter Fehler bei Regel "${rule.name}":`, err);
      }
    }
  },
};
