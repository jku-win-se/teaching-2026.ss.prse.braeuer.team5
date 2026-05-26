import { useState, useEffect, useCallback } from "react";
import { sceneService } from "../services/sceneService";
import { supabase } from "../config/supabaseClient";
import type { Scene } from "../types";

export type SceneDevice = {
  id: string;
  name: string;
  type: string;
  room_id: string;
  rooms?: { name: string };
};

export const useScenes = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [devices, setDevices] = useState<SceneDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [sceneData, { data: deviceData }] = await Promise.all([
        sceneService.fetchAllScenes(),
        supabase.from("devices").select("id, name, type, room_id, rooms (name)"),
      ]);
      setScenes(sceneData);
      setDevices((deviceData ?? []) as unknown as SceneDevice[]);
    } catch (err) {
      console.error("Fehler beim Laden der Szenen:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { scenes, devices, loading, refresh: loadData };
};
