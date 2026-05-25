import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import { eventBus } from "../customEvents/eventEmitter";
import { sceneService } from "./sceneService";
import type { VacationMode, Scene } from "../types";

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export const vacationModeService = {
  async fetchAll(): Promise<VacationMode[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("vacation_mode")
      .select("*, rooms (name), scenes (name)")
      .order("start_date", { ascending: true });
    if (error) throw error;
    return (data as VacationMode[]) || [];
  },

  async create(payload: Pick<VacationMode, "room_id" | "scene_id" | "start_date" | "end_date" | "daily_time">) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("vacation_mode")
      .insert([{ ...payload, is_active: true }])
      .select();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: Pick<VacationMode, "room_id" | "scene_id" | "start_date" | "end_date" | "daily_time">) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("vacation_mode")
      .update(payload)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },

  async toggle(id: string, is_active: boolean) {
    if (!supabase) return;
    const { error } = await supabase
      .from("vacation_mode")
      .update({ is_active })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("vacation_mode").delete().eq("id", id);
    if (error) throw error;
  },

  // Gibt room_ids zurück die aktuell durch Urlaubsmodus gesperrt sind
  async getActiveVacationRoomIds(): Promise<Set<string>> {
    if (!supabase) return new Set();
    const today = toDateString(new Date());
    const { data } = await supabase
      .from("vacation_mode")
      .select("room_id")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today);
    return new Set((data || []).map((r: { room_id: string }) => r.room_id));
  },

  async checkAndExecuteVacationMode() {
    if (!supabase) return;

    const now = new Date();
    const today = toDateString(now);
    const currentTime = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Abgelaufene Modi automatisch deaktivieren
    await supabase
      .from("vacation_mode")
      .update({ is_active: false })
      .eq("is_active", true)
      .lt("end_date", today);

    // Aktive Modi für heute holen
    const { data: activeModes, error } = await supabase
      .from("vacation_mode")
      .select("*, scenes (*)")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today);

    if (error || !activeModes || activeModes.length === 0) return;

    for (const mode of activeModes) {
      const modeTime = typeof mode.daily_time === "string"
        ? mode.daily_time.substring(0, 5)
        : "";
      if (modeTime !== currentTime) continue;
      if (!mode.scenes) continue;

      await sceneService.activateScene(mode.scenes as Scene);

      const logText = `Urlaubsmodus: Szene "${mode.scenes.name}" aktiviert`;
      await logAction({
        room_id: mode.room_id,
        action: "Urlaubsmodus ausgeführt",
        new_value: logText,
        actor_type: "automation",
        user_id: undefined,
      });
      if (eventBus) {
        await eventBus.emitChange({
          room_id: mode.room_id,
          action: "Urlaubsmodus ausgeführt",
          new_value: logText,
          actor_type: "automation",
          user_id: undefined,
        });
      }
    }
  },
};
