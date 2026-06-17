import { supabase } from "../config/supabaseClient";
import type { DeviceState, DeviceType, Schedule } from "../types";

/**
 * Gerätedarstellung im Simulator (vereinfacht, ohne Energiedaten).
 */
export type SimDevice = {
  /** Eindeutige UUID des Geräts. */
  id: string;
  /** Anzeigename des Geräts. */
  name: string;
  /** Gerätetyp. */
  type: DeviceType;
  /** UUID des zugehörigen Raums. */
  room_id: string;
  /** Aktueller Gerätezustand (als Ausgangsbasis für die Simulation). */
  state?: DeviceState;
  /** Raumname, per JOIN geladen. */
  rooms?: { name: string };
};

/** Service-Objekt für das Laden von Simulationsdaten (schreibgeschützt). */
export const simulationService = {

  /**
   * Lädt alle aktiven Zeitpläne inkl. Gerätedaten für den Simulator,
   * aufsteigend nach Uhrzeit sortiert.
   * @returns Array von {@link Schedule}-Objekten mit befülltem `devices`-Feld.
   */
  async fetchSimulationSchedules(): Promise<Schedule[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("schedules")
      .select(`*, devices (name, type, room_id, rooms (name))`)
      .eq("is_active", true)
      .order("time", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Schedule[];
  },

  /**
   * Lädt alle Geräte mit ihrem aktuellen Zustand und Raumzuordnung für den Simulator,
   * alphabetisch nach Name sortiert.
   * @returns Array von {@link SimDevice}-Objekten.
   */
  async fetchSimulationDevices(): Promise<SimDevice[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("devices")
      .select(`id, name, type, room_id, state, rooms (name)`)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as SimDevice[];
  },
};
