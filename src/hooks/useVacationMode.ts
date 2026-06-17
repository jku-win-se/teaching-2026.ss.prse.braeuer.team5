import { useState, useEffect, useCallback } from "react";
import { vacationModeService } from "../services/vacationModeService";
import { supabase } from "../config/supabaseClient";
import type { VacationMode } from "../types";
import type { Scene } from "../types";

/**
 * Reduzierte Szenen-Darstellung für die Urlaubsmodus-Auswahl
 * (nur ID, Name und Raumzuordnungen).
 */
export type VacationScene = Pick<Scene, "id" | "name"> & {
  /** Dem Raum zugeordnete Szenenräume (für Raumfilterung). */
  scene_rooms: { room_id: string }[];
};

/**
 * React-Hook zum Laden von Urlaubsmodus-Einträgen und verfügbaren Szenen.
 *
 * Lädt beim initialen Render alle Urlaubsmodi und alle Szenen parallel.
 *
 * @returns
 * - `modes` – Array aller {@link VacationMode}-Objekte
 * - `scenes` – Array aller {@link VacationScene}-Objekte (für Szenen-Auswahl im Formular)
 * - `loading` – `true` während des Ladevorgangs
 * - `refresh` – Lädt alle Daten erneut aus der Datenbank
 */
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
        supabase.from("scenes").select("id, name, scene_rooms(room_id)"),
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
