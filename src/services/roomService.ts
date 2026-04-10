import { supabase } from "../config/supabaseClient";
import type { Device, Room } from "../types";

export async function fetchRooms(): Promise<Room[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rooms")
    .select("*") as { data: Room[] | null; error: any };

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  } else if (data === null) {
    return [];
  } else {
    return data;
  }
}

export async function deleteRoomFromTable(roomId: string) : Promise<boolean> {
  if(!supabase) {
    console.error("Supabase client not initialized");
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