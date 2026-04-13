import { useEffect, useState } from "react";
import type { RoomRole } from "../types";
import { fetchRoomRole } from "../services/roomService";
import { supabase } from "../config/supabaseClient";

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
