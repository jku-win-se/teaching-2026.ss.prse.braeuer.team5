import { supabase } from "../config/supabaseClient";

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