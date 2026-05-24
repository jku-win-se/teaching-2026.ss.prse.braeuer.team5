import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { eventBus } from "../customEvents/eventEmitter";
import type { DeviceState, Schedule } from "../types";

const getLogValueText = (actionValue: DeviceState, scheduleName: string): string => {
  let detail = '';
  
  if (actionValue.on !== undefined) {
    detail = actionValue.on ? 'EIN' : 'AUS';
  } else if (actionValue.brightness !== undefined) {
    detail = `${actionValue.brightness}%`;
  } else if (actionValue.temperature !== undefined) {
    detail = `${actionValue.temperature}°C`;
  } else if (actionValue.position !== undefined) {
    detail = `Position ${actionValue.position}%`;
  } else {
    detail = JSON.stringify(actionValue);
  }

  return `Automatisch ${detail} durch "${scheduleName}"`;
};

export const scheduleService = {
  async fetchAllSchedules() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        devices (
          name,
          type,
          room_id,
          rooms (name)
        )
      `)
      .order('time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createSchedule(payload: Pick<Schedule, 'name' | 'room_id' | 'device_id' | 'time' | 'days' | 'action_value'>) {
    if (!supabase) return null;
    const formattedTime = payload.time.length === 5 ? `${payload.time}:00` : payload.time;

    const { data, error } = await supabase
      .from('schedules')
      .insert([{
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        time: formattedTime,
        days: payload.days,
        action_value: payload.action_value,
        is_active: true
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  async toggleSchedule(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from('schedules')
      .update({ is_active })
      .eq('id', id);
    if (error) throw error;
  },

  async updateSchedule(id: string, payload: Pick<Schedule, 'name' | 'room_id' | 'device_id' | 'time' | 'days' | 'action_value'>) {
    if (!supabase) return null;
    const formattedTime = payload.time.length === 5 ? `${payload.time}:00` : payload.time;

    const { data, error } = await supabase
      .from('schedules')
      .update({
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        time: formattedTime,
        days: payload.days,
        action_value: payload.action_value
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  async deleteSchedule(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async checkAndExecuteSchedules() {
    if (!supabase) return;
    const now = new Date();
    const currentTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
    const currentDay = now.getDay();

    const { data: activeSchedules, error } = await supabase
      .from('schedules')
      .select('*, devices(id, name, type, room_id)')
      .eq('is_active', true)
      .eq('time', `${currentTime}:00`);

    if (error || !activeSchedules || activeSchedules.length === 0) return;

    for (const schedule of activeSchedules) {
      if (schedule.days.includes(currentDay)) {
        console.log(`[Automation] ${schedule.name} wird ausgeführt...`);
        
        const { error: deviceError } = await supabase
          .from('devices')
          .update({ state: schedule.action_value })
          .eq('id', schedule.device_id);

        if (deviceError) continue;

        const logText = getLogValueText(schedule.action_value, schedule.name);

        await logAction({
          room_id: schedule.room_id,
          device_id: schedule.device_id,
          action: "Zeitplan ausgeführt",
          new_value: logText,
          actor_type: 'automation',
          user_id: undefined
        });

        if (eventBus) {
          await eventBus.emitChange({
            room_id: schedule.room_id,
            device_id: schedule.device_id,
            action: "Zeitplan ausgeführt",
            new_value: logText,
            actor_type: 'automation', 
            user_id: undefined
          });
        }
      }
    }
  }
};