import { useState, useEffect } from "react";
import { type Room } from "../types";
import { fetchRooms, addToRoomTable, updateRoomInTable, deleteRoomFromTable } from "../services/roomService";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  const addRoom = async (name: string): Promise<boolean> => {
    const newId = await addToRoomTable(name);
    if (newId) {
      setRooms((current) => [...current, { id: newId, name }]);
      return true;
    }
    return false;
  };

  const updateRoom = async (id: string, name: string) => {
    const success = await updateRoomInTable(id, name);
    if (success) {
      setRooms((current) => current.map((r) => (r.id === id ? { ...r, name } : r)));
    }
  };

  const deleteRoom = async (id: string): Promise<boolean> => {
    const success = await deleteRoomFromTable(id);
    if (success) {
      setRooms((current) => current.filter((r) => r.id !== id));
    }
    return success;
  };

  return { rooms, addRoom, updateRoom, deleteRoom };
}
