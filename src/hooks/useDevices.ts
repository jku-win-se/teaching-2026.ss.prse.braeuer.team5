import { useState, useEffect } from "react";
import { type Device, type DeviceType, type DeviceState } from "../types";
import { fetchDevices, addDeviceToRoom, deleteDevice, updateDeviceName, updateDeviceState } from "../services/deviceService";

export function useDevices(roomId: string | undefined) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    let isCancelled = false;

    const loadDevices = async () => {
      setLoading(true);
      const loadedDevices = await fetchDevices(roomId);

      if (isCancelled) {
        return;
      }

      setDevices(loadedDevices);
      setLoading(false);
    };

    void loadDevices();

    return () => {
      isCancelled = true;
    };
  }, [roomId]);

  const addDevice = async (deviceName: string, type: DeviceType, energyConsumption: number | null) => {
    if (!roomId) return;
    const newDevice = await addDeviceToRoom(roomId, deviceName, type, energyConsumption);
    if (newDevice) {
      setDevices((current) => [...current, newDevice]);
    }
  };

  const removeDevice = async (deviceId: string) => {
    const success = await deleteDevice(deviceId);
    if (success) {
      setDevices((current) => current.filter((d) => d.id !== deviceId));
    }
    return success;
  };

  const renameDevice = async (deviceId: string, newName: string) => {
    const success = await updateDeviceName(deviceId, newName);
    if (success) {
      setDevices((current) =>
        current.map((d) => (d.id === deviceId ? { ...d, name: newName } : d))
      );
    }
  };

  const toggleDevice = async (deviceId: string, newOn: boolean) => {
    setDevices((current) =>
      current.map((d) =>
        d.id === deviceId ? { ...d, state: { ...d.state, on: newOn } } : d
      )
    );
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      await updateDeviceState(deviceId, { ...device.state, on: newOn });
    }
  };

  const changeDeviceState = async (deviceId: string, newState: Partial<DeviceState>) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;
    const updatedState = { ...device.state, ...newState };
    setDevices((current) =>
      current.map((d) => (d.id === deviceId ? { ...d, state: updatedState } : d))
    );
    await updateDeviceState(deviceId, updatedState);
  };

  return { devices, loading, addDevice, removeDevice, renameDevice, toggleDevice, changeDeviceState };
}
