import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { vacationModeService } from "./vacationModeService";
import type { DeviceState, Schedule } from "../types";

/**
 * Erzeugt einen lesbaren Log-Text für einen ausgeführten Zeitplan.
 * @param actionValue - Gerätezustand, der durch den Zeitplan gesetzt wurde.
 * @param scheduleName - Name des Zeitplans.
 * @returns Formatierter Beschreibungstext.
 */
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

/**
 * Normalisiert einen Aktionszustand: Setzt `on: true` wenn relevante Felder
 * (brightness, temperature, position, value) vorhanden sind, aber `on` fehlt.
 * Setzt `on: false` wenn keine steuernden Felder vorhanden sind.
 * @param actionValue - Ursprünglicher Aktionszustand.
 * @returns Normalisierter Zustand mit gesetztem `on`-Feld.
 */
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

/** Service-Objekt für alle Zeitplan-Operationen (CRUD + Ausführung). */
export const scheduleService = {

  /**
   * Lädt alle Zeitpläne inkl. Gerätedaten, aufsteigend nach Uhrzeit sortiert.
   * Normalisiert `action_value` aller Einträge mit {@link normalizeActionValue}.
   * @returns Array von {@link Schedule}-Objekten.
   */
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

  /**
   * Erstellt einen neuen Zeitplan. Normalisiert die Uhrzeit auf `HH:MM:SS`
   * und den Aktionszustand mit {@link normalizeActionValue}.
   * @param payload - Zeitplankonfiguration (Name, Raum, Gerät, Zeit, Tage, Aktion).
   * @returns Die erstellten Datenbankzeilen oder `null`.
   */
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

  /**
   * Schaltet den Aktiv-Status eines Zeitplans um.
   * @param id - UUID des Zeitplans.
   * @param is_active - Neuer Aktiv-Status.
   */
  async toggleSchedule(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from('schedules')
      .update({ is_active })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Aktualisiert einen bestehenden Zeitplan.
   * @param id - UUID des Zeitplans.
   * @param payload - Neue Zeitplankonfiguration.
   * @returns Die aktualisierten Datenbankzeilen oder `null`.
   */
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

  /**
   * Löscht einen Zeitplan unwiderruflich.
   * @param id - UUID des Zeitplans.
   */
  async deleteSchedule(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Prüft alle aktiven Zeitpläne gegen die aktuelle Uhrzeit und den aktuellen Wochentag
   * und führt fällige Zeitpläne aus. Überspringt Räume, für die ein aktiver
   * Urlaubsmodus gilt (via {@link vacationModeService.getActiveVacationRoomIds}).
   *
   * Wird von {@link useAutomation} jede Minute aufgerufen.
   * Schreibt nach jeder Ausführung einen Aktivitäts-Log-Eintrag.
   */
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
