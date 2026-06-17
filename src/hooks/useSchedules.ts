import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { supabase } from '../config/supabaseClient';
import type { Schedule } from '../types';

/**
 * Gerätedarstellung für die Zeitplan-Verwaltung (inkl. `state` für Vorschau).
 */
export type ScheduleDevice = {
  /** Eindeutige UUID des Geräts. */
  id: string;
  /** Anzeigename des Geräts. */
  name: string;
  /** Gerätetyp als String. */
  type: string;
  /** UUID des zugehörigen Raums. */
  room_id: string;
  /** Raumname, per JOIN geladen. */
  rooms?: { name: string };
  /** Aktueller Gerätezustand (für typen-spezifische Vorschau). */
  state: string;
};

/**
 * React-Hook zum Laden von Zeitplänen und verfügbaren Geräten.
 *
 * Lädt beim initialen Render alle Zeitpläne (inkl. Gerätedaten) und
 * alle Geräte parallel.
 *
 * @returns
 * - `schedules` – Array aller {@link Schedule}-Objekte mit normalisierten `action_value`
 * - `devices` – Array aller {@link ScheduleDevice}-Objekte (für Gerät-Auswahl im Formular)
 * - `loading` – `true` während des Ladevorgangs
 * - `refresh` – Lädt alle Daten erneut aus der Datenbank
 */
export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<ScheduleDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [sData, { data: dData }] = await Promise.all([
        scheduleService.fetchAllSchedules(),
        supabase.from('devices').select(`id, name, type, room_id, rooms (name), state`)
      ]);
      setSchedules(sData as Schedule[]);
      setDevices((dData ?? []) as unknown as ScheduleDevice[]);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { schedules, devices, loading, refresh: loadData };
};
