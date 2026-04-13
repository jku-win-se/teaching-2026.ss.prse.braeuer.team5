import { useState, useEffect } from "react";
import { fetchNumberOfDevicesInRoom } from "../services/roomService";

export function useDeviceCount(roomId: string): number {
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    fetchNumberOfDevicesInRoom(roomId).then(setDeviceCount);
  }, [roomId]);

  return deviceCount;
}
