import { supabase } from "../config/supabaseClient";
import type { Device, DeviceType, DeviceState } from "../types";

export async function fetchDevices(roomId: string): Promise<Device[]> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching devices:", error);
    return [];
  }

  return data || [];
}

export async function addDeviceToRoom(
  roomId: string,
  name: string,
  type: DeviceType,
  energy_consumption?: number | null,
  initialState?: DeviceState
): Promise<Device | null> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("devices")
    .insert({
      room_id: roomId,
      name,
      type,
      energy_consumption: energy_consumption ?? null,
      state: initialState ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding device:", error);
    alert("Fehler beim Erstellen des Geräts: " + error.message);
    return null;
  }

  return data;
}

export async function deleteDevice(deviceId: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const { error } = await supabase
    .from("devices")
    .delete()
    .eq("id", deviceId);

  if (error) {
    console.error("Error deleting device:", error);
    alert("Fehler beim Löschen: " + error.message);
    return false;
  }

  return true;
}

export async function updateDevice(
  deviceId: string,
  updates: Partial<Device>
): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const { error } = await supabase
    .from("devices")
    .update(updates)
    .eq("id", deviceId);

  if (error) {
    console.error("Error updating device:", error);
    alert("Fehler beim Aktualisieren: " + error.message);
    return false;
  }

  return true;
}

export async function updateDeviceName(
  deviceId: string,
  name: string
): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const { error } = await supabase
    .from("devices")
    .update({ name })
    .eq("id", deviceId);

  if (error) {
    console.error("Error updating device name:", error);
    alert("Fehler beim Aktualisieren des Namens: " + error.message);
    return false;
  }

  return true;
}

//FR-06
export const updateDeviceState = async (deviceId: string, newState: DeviceState) => {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const { data, error } = await supabase
    .from('devices')
    .update({ state: newState }) 
    .eq('id', deviceId)
    .select();

  if (error) {
    console.error("Fehler beim Update des Zustands:", error);
    return null;
  }
  return data[0];
};
