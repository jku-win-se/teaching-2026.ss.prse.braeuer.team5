import { describe, it, expect, beforeAll } from "vitest";
import { supabase } from "../config/supabaseClient";
// Importiere deine Funktionen (du musst sie eventuell exportieren)
import { addToRoomTable, updateRoomInTable, deleteRoomFromTable } from "../services/roomService";

describe("Rooms Datenbank-Logik", () => {
  
  // Vor den Tests: Sicherstellen, dass wir eingeloggt sind (wegen RLS)
  beforeAll(async () => {
    
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: '1234'
    });
    if (error) throw new Error("Auth fehlgeschlagen: " + error.message);
  });

  it("Soll einen Raum erstellen und die ID zurückgeben", async () => {
    const testName = "Test-Raum-" + Date.now();
    
    // 1. Erstellen
    const newId = await addToRoomTable(testName);
    
    expect(newId).not.toBeNull();
    expect(typeof newId).toBe("string");


    if (!supabase) return;
    // 2. Verifizieren (Steht er wirklich in der Tabelle?)
    const { data } = await supabase.from("rooms").select("*").eq("id", newId!).single();
    expect(data?.name).toBe(testName);

    // Cleanup: Direkt wieder löschen
    await deleteRoomFromTable(newId!);
  });

  it("Soll einen bestehenden Raum umbenennen", async () => {
    // Vorbereitung: Raum erstellen
    const id = await addToRoomTable("Alter Name");
    
    // 1. Update ausführen
    const success = await updateRoomInTable(id!, "Neuer Name");
    expect(success).toBe(true);

    // 2. Datenbank prüfen
    if (!supabase) return;
    const { data } = await supabase.from("rooms").select("name").eq("id", id!).single();
    expect(data?.name).toBe("Neuer Name");

    // Cleanup
    await deleteRoomFromTable(id!);
  });

  it("Soll einen Raum erfolgreich aus der Tabelle löschen", async () => {
    const id = await addToRoomTable("Lösch mich");
    
    // 1. Löschen
    await deleteRoomFromTable(id!);

    // 2. Prüfen ob er weg ist
    if (!supabase) return;
    const { data } = await supabase.from("rooms").select("*").eq("id", id!);
    expect(data?.length).toBe(0);
  });
});