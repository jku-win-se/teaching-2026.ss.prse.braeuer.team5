import { supabase } from "../config/supabaseClient";
import type { DeviceState, DeviceType, Schedule } from "../types";

export type SimDevice = {
  id: string;
  name: string;
  type: DeviceType;
  room_id: string;
  state?: DeviceState;
  rooms?: { name: string };
};

export const simulationService = {
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
