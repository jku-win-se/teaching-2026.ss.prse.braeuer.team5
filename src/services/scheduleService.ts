import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { vacationModeService } from "./vacationModeService";
import type { DeviceState, Schedule } from "../types";

const getLogValueText = (actionValue: DeviceState, scheduleName: string): string => {
  const parts: string[] = [];
  
  if (actionValue.on !== undefined) {
    parts.push(actionValue.on ? 'EIN' : 'AUS');
  }
  if (actionValue.brightness !== undefined) {
    parts.push(`${actionValue.brightness}%`);
  }
  if (actionValue.temperature !== undefined) {
    parts.push(`${actionValue.temperature}°C`);
  }
  if (actionValue.position !== undefined) {
    parts.push(`Position ${actionValue.position}%`);
  }

  const detail = parts.length > 0 ? parts.join(', ') : JSON.stringify(actionValue);
  return `Automatisch ${detail} durch "${scheduleName}"`;
};

const normalizeActionValue = (actionValue?: DeviceState): DeviceState => {
  const normalized = { ...(actionValue ?? {}) };

  if (normalized.on !== undefined) {
    return normalized;
  }

  if (
    normalized.brightness !== undefined ||
    normalized.temperature !== undefined ||
    normalized.position !== undefined ||
    normalized.value !== undefined
  ) {
    return { ...normalized, on: true };
  }

  return { ...normalized, on: false };
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
          rooms (name),
          state
        )
      `)
      .order('time', { ascending: true });
    
    if (error) throw error;

    return (data || []).map((schedule) => ({
      ...schedule,
      action_value: normalizeActionValue(schedule.action_value as DeviceState | undefined),
    }));
  },

  async createSchedule(payload: Pick<Schedule, 'name' | 'room_id' | 'device_id' | 'time' | 'days' | 'action_value'>) {
    if (!supabase) return null;
    const formattedTime = payload.time.length === 5 ? `${payload.time}:00` : payload.time;
    const action_value = normalizeActionValue(payload.action_value);

    const { data, error } = await supabase
      .from('schedules')
      .insert([{
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        time: formattedTime,
        days: payload.days,
        action_value
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
    const action_value = normalizeActionValue(payload.action_value);

    const { data, error } = await supabase
      .from('schedules')
      .update({
        name: payload.name,
        room_id: payload.room_id,
        device_id: payload.device_id,
        time: formattedTime,
        days: payload.days,
        action_value
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

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentLocalTime = `${hours}:${minutes}`;

    const currentDayNum = now.getDay();
    const currentDayStr = String(currentDayNum);

    const vacationRooms = await vacationModeService.getActiveVacationRoomIds();

    const { data: activeSchedules, error } = await supabase
      .from('schedules')
      .select('*, devices(id, name, type, room_id, state)')
      .eq('is_active', true);

    if (error) {
      console.error("[Automation] Fehler beim Laden der Zeitpläne:", error.message);
      return;
    }

    if (!activeSchedules || activeSchedules.length === 0) return;

    for (const schedule of activeSchedules) {
      if (vacationRooms.has(schedule.room_id)) continue;

      const scheduleTimeShort = schedule.time ? schedule.time.substring(0, 5) : '';

      const isTimeMatch = scheduleTimeShort === currentLocalTime;
      const isDayMatch = schedule.days.includes(currentDayNum) || schedule.days.includes(currentDayStr);

      if (isTimeMatch && isDayMatch) {

        const rawDevice = Array.isArray(schedule.devices) ? schedule.devices[0] : schedule.devices;
        if (!rawDevice) continue;

        const currentDeviceState = (rawDevice.state as DeviceState) || {};
        const deviceType = String(rawDevice.type || '').toLowerCase();
        const normalizedActionValue = normalizeActionValue(schedule.action_value);

        const targetState: DeviceState = {
          ...currentDeviceState,
          ...normalizedActionValue
        };

        if (deviceType.includes('thermostat') && normalizedActionValue.temperature !== undefined) {
          targetState.on = true;
        }
        else if (deviceType.includes('dimmer') && normalizedActionValue.brightness !== undefined) {
          targetState.on = true;
        }
        else if (deviceType.includes('jalousie') && normalizedActionValue.position !== undefined) {
          targetState.on = true;
        }
        else if (deviceType.includes('sensor') && normalizedActionValue.value !== undefined) {
          targetState.on = true;
        }

        const { error: deviceError } = await supabase
          .from('devices')
          .update({ state: targetState })
          .eq('id', schedule.device_id)
          .select();

        if (deviceError) {
          console.error(`[Automation] Update fehlgeschlagen für ${schedule.name}:`, deviceError.message);
          continue;
        }

        const logText = getLogValueText(targetState, schedule.name);
        await logAction({
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
};