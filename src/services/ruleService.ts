import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { eventBus } from "../customEvents/eventEmitter";
import { ruleNotifier } from "../customEvents/ruleNotifier";
import type { RuleCondition, DeviceState, Rule } from "../types";

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

export function evaluateCondition(cond: RuleCondition, state: DeviceState): boolean {
  const current = (state as any)[cond.field];
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

function cooldownElapsed(lastTriggeredAt: string | null | undefined, cooldownMs: number): boolean {
  if (!lastTriggeredAt) return true;
  const elapsed = (Date.now() - new Date(lastTriggeredAt).getTime());
  return elapsed >= cooldownMs;
}

export const ruleService = {

  async getRulesForDevice(deviceId: string): Promise<Rule[] | []> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('device_id', deviceId);
    if (error) throw error;
    return data as Rule[] || [];
  },


  async fetchAllRules() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createRule(payload: any) {
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

  async updateRule(id: string, payload: any) {
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

  async toggleRule(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from('rules')
      .update({ is_active })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteRule(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

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
          console.log(`[RuleEngine] Regel "${rule.name}" wird übersprungen (Cooldown)`);
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

        console.log(`[RuleEngine] Regel "${rule.name}" wird ausgeführt...`);

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
          user_id: null,
        });

        if (eventBus) {
          await eventBus.emitChange({
            room_id: roomId,
            device_id: rule.action.device_id,
            action: 'Regel ausgeführt',
            new_value: logText,
            actor_type: 'automation',
            user_id: undefined,
          });
        }

        ruleNotifier.emit(rule.name);
      } catch (err) {
        console.error(`[RuleEngine] Unerwarteter Fehler bei Regel "${rule.name}":`, err);
      }
    }
  },
};
