import { useState, useEffect, useCallback } from "react";
import { vacationModeService } from "../services/vacationModeService";
import { supabase } from "../config/supabaseClient";
import type { VacationMode } from "../types";
import type { Scene } from "../types";

export type VacationScene = Pick<Scene, "id" | "name">;

export const useVacationMode = () => {
  const [modes, setModes] = useState<VacationMode[]>([]);
  const [scenes, setScenes] = useState<VacationScene[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [modeData, { data: sceneData }] = await Promise.all([
        vacationModeService.fetchAll(),
        supabase.from("scenes").select("id, name"),
      ]);
      setModes(modeData);
      setScenes((sceneData ?? []) as unknown as VacationScene[]);
    } catch (err) {
      console.error("Fehler beim Laden des Urlaubsmodus:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { modes, scenes, loading, refresh: loadData };
};
