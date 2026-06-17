import { useState, useEffect } from "react";
import { type Room } from "../types";
import { fetchRooms, addToRoomTable, updateRoomInTable, deleteRoomFromTable } from "../services/roomService";

/**
 * React-Hook zur Verwaltung der Raumliste des aktuellen Nutzers.
 *
 * Lädt beim initialen Render alle Räume via {@link fetchRooms} und
 * hält eine lokale Kopie für optimistische Updates aktuell.
 *
 * @returns
 * - `rooms` – Array der aktuellen {@link Room}-Objekte mit befülltem `role`-Feld
 * - `addRoom` – Erstellt einen neuen Raum; gibt `true` bei Erfolg zurück
 * - `updateRoom` – Benennt einen Raum um
 * - `deleteRoom` – Löscht einen Raum; gibt `true` bei Erfolg zurück
 */
export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  /**
   * Erstellt einen neuen Raum und fügt ihn der lokalen Liste hinzu.
   * Der aktuelle Nutzer wird automatisch als Owner gesetzt.
   * @param name - Anzeigename des neuen Raums.
   * @returns `true` wenn der Raum erfolgreich erstellt wurde.
   */
  const addRoom = async (name: string): Promise<boolean> => {
    const newId = await addToRoomTable(name);
    if (newId) {
      setRooms((current) => [...current, { id: newId, name, role: "owner" }]);
      return true;
    }
    return false;
  };

  /**
   * Benennt einen Raum um und aktualisiert die lokale Liste.
   * @param id - UUID des Raums.
   * @param name - Neuer Anzeigename.
   */
  const updateRoom = async (id: string, name: string) => {
    const success = await updateRoomInTable(id, name);
    if (success) {
      setRooms((current) => current.map((r) => (r.id === id ? { ...r, name } : r)));
    }
  };

  /**
   * Löscht einen Raum und entfernt ihn aus der lokalen Liste.
   * @param id - UUID des Raums.
   * @returns `true` bei Erfolg.
   */
  const deleteRoom = async (id: string): Promise<boolean> => {
    const success = await deleteRoomFromTable(id);
    if (success) {
      setRooms((current) => current.filter((r) => r.id !== id));
    }
    return success;
  };

  return { rooms, addRoom, updateRoom, deleteRoom };
}
