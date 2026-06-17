import { useState, useEffect } from "react";
import { fetchNumberOfDevicesInRoom } from "../services/roomService";

/**
 * React-Hook zum Abrufen der Geräteanzahl in einem Raum.
 * Wird auf der Raumübersicht ({@link Rooms}) für die Anzeige der Geräteanzahl genutzt.
 *
 * @param roomId - UUID des Raums.
 * @returns Aktuelle Anzahl der Geräte im Raum (0 während des Ladevorgangs).
 */
export function useDeviceCount(roomId: string): number {
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    fetchNumberOfDevicesInRoom(roomId).then(setDeviceCount);
  }, [roomId]);

  return deviceCount;
}
