import { useEffect, useState } from "react";
import type { RoomRole } from "../types";
import { fetchRoomRole } from "../services/roomService";
import { supabase } from "../config/supabaseClient";

/**
 * React-Hook zum Abrufen der Rolle des aktuellen Nutzers in einem Raum.
 *
 * Lädt die Rolle neu wenn sich `roomId` ändert. Räumt ausstehende
 * asynchrone Operationen beim Unmount auf.
 *
 * @param roomId - UUID des Raums. Bei `undefined` wird `role` auf `null` gesetzt.
 * @returns
 * - `role` – `"owner"`, `"member"` oder `null` wenn keine Mitgliedschaft besteht
 * - `loading` – `true` während des Ladevorgangs
 * - `canManage` – `true` wenn `role === "owner"` (für Berechtigungsprüfungen in der UI)
 */
export function useRoomRole(roomId: string | undefined) {
  const [role, setRole] = useState<RoomRole | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRole = async () => {
      if (!roomId) {
        setRole(null);
        return;
      }

      setLoading(true);

      const userId = (await supabase?.auth.getUser())?.data?.user?.id;
      const nextRole = await fetchRoomRole(roomId, userId);

      if (active) {
        setRole(nextRole);
        setLoading(false);
      }
    };

    loadRole();

    return () => {
      active = false;
    };
  }, [roomId]);

  return { role, loading, canManage: role === "owner" };
}
