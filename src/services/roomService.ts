import { supabase } from "../config/supabaseClient";
import type { Device, Room, RoomMembership, RoomRole } from "../types";

async function fetchOwnRoomMemberships(): Promise<RoomMembership[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("room_members")
    .select("room_id, role") as { data: RoomMembership[] | null; error: any };

  if (error) {
    console.error("Error fetching room memberships:", error);
    return [];
  }

  return data ?? [];
}

export async function fetchRoomRole(roomId: string): Promise<RoomRole | null> {
  const memberships = await fetchOwnRoomMemberships();
  return memberships.find((membership) => membership.room_id === roomId)?.role ?? null;
}

async function requireOwnerRole(roomId: string, actionLabel: string): Promise<boolean> {
  const role = await fetchRoomRole(roomId);

  if (role === "owner") {
    return true;
  }

  alert(`Nur Eigentuemer duerfen ${actionLabel}.`);
  return false;
}

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
    .in("id", roomIds) as { data: Room[] | null; error: any };

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  } else if (data === null) {
    return [];
  } else {
    return data.map((room) => ({ ...room, role: roleByRoomId[room.id] }));
  }
}

export async function deleteRoomFromTable(roomId: string) : Promise<boolean> {
  if(!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const canDelete = await requireOwnerRole(roomId, "Raeume loeschen");
  if (!canDelete) {
    return false;
  }

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

export async function updateRoomInTable(roomId: string, newName: string) : Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

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

  return true;
}

// 1. In der addToRoomTable Funktion geben wir die ID zurück
export async function addToRoomTable(roomName: string) : Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("create_room_with_member", {
      room_name: roomName,
  });

  if (error) {
    alert("Fehler beim Erstellen: " + error.message);
    return null;
  }
  
  return data; // Hier kommt die echte UUID von Supabase zurück!
}


export async function fetchNumberOfDevicesInRoom(roomId: string): Promise<number> {

  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("devices")
    .select("*", { count: "exact" })
    .eq("room_id", roomId) as { data: Device[] | null; error: any; count: number | null };

  if (error) {
    console.error("Error fetching device count:", error);
    return 0;
  } else if(data === null || data === undefined) {
    return 0;
  } else{
    return data.length;
  }

}
