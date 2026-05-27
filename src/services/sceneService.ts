import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import type { Scene, SceneDeviceEntry } from "../types";

export const sceneService = {
  async fetchAllScenes(): Promise<Scene[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("scenes")
      .select("*, scene_rooms(room_id, rooms(name))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Scene[]) || [];
  },

  async createScene(payload: Pick<Scene, "name" | "description" | "device_states">): Promise<Scene | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("scenes")
      .insert([{
        name: payload.name,
        description: payload.description || null,
        device_states: payload.device_states,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateScene(id: string, payload: Pick<Scene, "name" | "description" | "device_states">) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("scenes")
      .update({
        name: payload.name,
        description: payload.description || null,
        device_states: payload.device_states,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async assignRooms(sceneId: string, roomIds: string[]) {
    if (!supabase) return;
    const { error } = await supabase.rpc("assign_scene_rooms", {
      p_scene_id: sceneId,
      p_room_ids: roomIds,
    });
    if (error) throw error;
  },

  async deleteScene(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("scenes").delete().eq("id", id);
    if (error) throw error;
  },

  async activateScene(scene: Scene): Promise<{ ok: boolean; errors: string[] }> {
    if (!supabase) return { ok: false, errors: ["Supabase nicht konfiguriert"] };
    const userId = (await supabase.auth.getUser())?.data?.user?.id ?? undefined;

    const entries = scene.device_states as SceneDeviceEntry[];
    if (entries.length === 0) {
      return { ok: false, errors: ["Szene hat keine Gerätezustände"] };
    }

    const errors: string[] = [];

    for (const entry of entries) {
      const { error } = await supabase
        .from("devices")
        .update({ state: entry.target_state })
        .eq("id", entry.device_id);

      if (error) {
        console.error(`[Scene] Update fehlgeschlagen für ${entry.device_id}:`, error);
        errors.push(`${entry.device_id}: ${error.message}`);
      }
    }

    const logText = `Szene "${scene.name}" aktiviert (${entries.length} Gerät${entries.length !== 1 ? "e" : ""})`;
    const roomIds = (scene.scene_rooms || []).map((sr) => sr.room_id);
    const primaryRoomId = roomIds[0];

    await logAction({
      room_id: primaryRoomId,
      action: "Szene aktiviert",
      new_value: logText,
      actor_type: "user",
      user_id: userId,
    });

    return { ok: errors.length === 0, errors };
  },
};