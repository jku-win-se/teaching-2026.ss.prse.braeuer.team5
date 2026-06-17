import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import type { Device, Room, RoomMembership, RoomRole } from "../types";

/**
 * Gibt die UUID des aktuell authentifizierten Nutzers zurück.
 * @returns Nutzer-UUID oder `null` wenn keine Session vorhanden ist.
 */
async function getCurrentUserId(): Promise<string | null> {
  return (await supabase?.auth.getUser())?.data?.user?.id ?? null;
}

/**
 * Lädt alle Raum-Mitgliedschaften des aktuellen Nutzers.
 * @returns Array von {@link RoomMembership}-Objekten oder leeres Array bei Fehler.
 */
async function fetchOwnRoomMemberships(): Promise<RoomMembership[]> {
  if (!supabase) return [];

  const userId = (await supabase.auth.getUser())?.data?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("room_members")
    .select("room_id, role, user_id")
    .eq("user_id", userId) as { data: RoomMembership[] | null; error: PostgrestError | null };

  if (error) {
    console.error("Error fetching room memberships:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Gibt die Rolle eines Nutzers in einem bestimmten Raum zurück.
 * @param roomId - UUID des Raums.
 * @param userId - UUID des Nutzers.
 * @returns `"owner"` oder `"member"` oder `null` wenn keine Mitgliedschaft besteht.
 */
export async function fetchRoomRole(roomId: string, userId: string | undefined): Promise<RoomRole | null> {
  const memberships = await fetchOwnRoomMemberships();
  return memberships.find((membership) => membership.room_id === roomId && membership.user_id === userId)?.role ?? null;
}

/**
 * Prüft, ob der aktuelle Nutzer Eigentümer des Raums ist.
 * Zeigt einen Alert an und gibt `false` zurück, wenn nicht.
 * @param roomId - UUID des Raums.
 * @param actionLabel - Beschreibung der Aktion (für die Alert-Meldung).
 * @returns `true` wenn der Nutzer Owner ist, sonst `false`.
 */
async function requireOwnerRole(roomId: string, actionLabel: string): Promise<boolean> {
  const userId = (await supabase?.auth.getUser())?.data?.user?.id;
  if (!userId) {
    alert(`Nur Eigentuemer duerfen ${actionLabel}.`);
    return false;
  }
  const role = await fetchRoomRole(roomId, userId);

  if (role === "owner") {
    return true;
  }

  alert(`Nur Eigentuemer duerfen ${actionLabel}.`);
  return false;
}

/**
 * Lädt alle Räume, auf die der aktuelle Nutzer Zugriff hat, inklusive seiner Rolle.
 * @returns Array von {@link Room}-Objekten mit befülltem `role`-Feld.
 */
export async function fetchRooms(): Promise<Room[]> {
  if (!supabase) return [];

  const memberships = await fetchOwnRoomMemberships();
  if (memberships.length === 0) return [];

  const roleByRoomId = Object.fromEntries(
    memberships.map((membership) => [membership.room_id, membership.role])
  ) as Record<string, RoomRole>;
  const roomIds = Object.keys(roleByRoomId);

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .in("id", roomIds) as { data: Room[] | null; error: PostgrestError | null };

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  } else if (data === null) {
    return [];
  } else {
    return data.map((room) => ({ ...room, role: roleByRoomId[room.id] }));
  }
}

/**
 * Löscht einen Raum (nur für Owner). Schreibt einen Aktivitäts-Log-Eintrag.
 * @param roomId - UUID des zu löschenden Raums.
 * @returns `true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
 */
export async function deleteRoomFromTable(roomId: string) : Promise<boolean> {
  if(!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const userId = await getCurrentUserId();

  const canDelete = await requireOwnerRole(roomId, "Raeume loeschen");
  if (!canDelete) {
    return false;
  }

  await logAction({
    room_id: roomId,
    action: "Room Deleted",
    new_value: `Raum wurde entfernt`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (error) {
    alert("Fehler beim Löschen: " + error.message);
    return false;
  }

  return true;
}

/**
 * Benennt einen Raum um (nur für Owner). Schreibt einen Aktivitäts-Log-Eintrag.
 * @param roomId - UUID des Raums.
 * @param newName - Neuer Anzeigename.
 * @returns `true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
 */
export async function updateRoomInTable(roomId: string, newName: string) : Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const userId = await getCurrentUserId();

  const canUpdate = await requireOwnerRole(roomId, "Raeume bearbeiten");
  if (!canUpdate) {
    return false;
  }

  const { error } = await supabase
    .from("rooms")
    .update({ name: newName })
    .eq("id", roomId);

  if (error) {
    alert("Fehler beim Aktualisieren: " + error.message);
    return false;
  }

  await logAction({
    room_id: roomId,
    action: "Room Updated",
    new_value: `Raumname geändert zu ${newName}`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  return true;
}

/**
 * Erstellt einen neuen Raum und setzt den aktuellen Nutzer als Owner.
 * Verwendet die Supabase-RPC `create_room_with_member`.
 * @param roomName - Anzeigename des neuen Raums.
 * @returns UUID des neu erstellten Raums oder `null` bei Fehler.
 */
export async function addToRoomTable(roomName: string) : Promise<string | null> {
  if (!supabase) return null;

  const userId = await getCurrentUserId();

  const { data, error } = await supabase.rpc("create_room_with_member", {
      room_name: roomName,
  });

  if (error) {
    alert("Fehler beim Erstellen: " + error.message);
    return null;
  }

  if (data) {
    await logAction({
      room_id: data,
      action: "Room Created",
      new_value: `Raum: ${roomName}`,
      actor_type: 'user',
      user_id: userId || undefined,
    });
  }

  return data;
}


/**
 * Zählt die Geräte in einem bestimmten Raum.
 * @param roomId - UUID des Raums.
 * @returns Anzahl der Geräte oder `0` bei Fehler.
 */
export async function fetchNumberOfDevicesInRoom(roomId: string): Promise<number> {

  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("devices")
    .select("*", { count: "exact" })
    .eq("room_id", roomId) as { data: Device[] | null; error: PostgrestError | null; count: number | null };

  if (error) {
    console.error("Error fetching device count:", error);
    return 0;
  } else if(data === null || data === undefined) {
    return 0;
  } else{
    return data.length;
  }

}
