import { useState, useEffect, useCallback } from "react";
import { sceneService } from "../services/sceneService";
import { supabase } from "../config/supabaseClient";
import type { Scene } from "../types";

/**
 * Gerätedarstellung für die Szenen-Verwaltung (ohne Energiedaten).
 */
export type SceneDevice = {
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
};

/**
 * React-Hook zum Laden von Szenen und verfügbaren Geräten.
 *
 * Lädt beim initialen Render alle Szenen (inkl. Raumzuordnungen) und
 * alle Geräte parallel.
 *
 * @returns
 * - `scenes` – Array aller {@link Scene}-Objekte
 * - `devices` – Array aller {@link SceneDevice}-Objekte (für Gerätezustand-Editor)
 * - `loading` – `true` während des Ladevorgangs
 * - `refresh` – Lädt alle Daten erneut aus der Datenbank
 */
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
