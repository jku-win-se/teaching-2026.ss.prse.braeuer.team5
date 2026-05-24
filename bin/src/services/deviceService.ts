import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient";
import type { Device, DeviceType, DeviceState } from "../types";
import { fetchRoomRole } from "./roomService";
import { eventBus } from "../customEvents/eventEmitter";
import { ruleService } from "./ruleService";

async function getCurrentUserId(): Promise<string | null> {
  return (await supabase?.auth.getUser())?.data?.user?.id ?? null;
}

async function requireOwnerForRoom(roomId: string, actionLabel: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }
  const role = await fetchRoomRole(roomId, userId);

  if (role === "owner") {
    return true;
  }

  alert(`Nur Eigentuemer duerfen ${actionLabel}.`);
  return false;
}

async function fetchDeviceRoomId(deviceId: string): Promise<string | null> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("devices")
    .select("room_id")
    .eq("id", deviceId)
    .single() as { data: { room_id: string } | null; error: PostgrestError | null };

  if (error) {
    console.error("Error fetching device room:", error);
    return null;
  }

  return data?.room_id ?? null;
}

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

  const userId = await getCurrentUserId();

  const canAdd = await requireOwnerForRoom(roomId, "Geraete hinzufuegen");
  if (!canAdd) {
    return null;
  }

  // default values
  let finalState = initialState;

  if (!finalState || Object.keys(finalState).length === 0) {
    switch (type) {
      case "Dimmer":
        finalState = { 
          on: true,
          brightness: 50
        };
        break;
      case "Schalter":
        finalState = { 
          on: false
        };
        break;
      case "Thermostat":
        finalState = { 
          temperature: 21
        };
        break;
      case "Jalousie":
        finalState = { 
          position: 'geschlossen'
        };
        break;
      case "Sensor":
        finalState = { value: 0 };
        break;
      default:
        finalState = {};
    }
  }

  const { data, error } = await supabase
    .from("devices")
    .insert({
      room_id: roomId,
      name,
      type,
      energy_consumption: energy_consumption ?? null,
      state: finalState,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding device:", error);
    alert("Fehler beim Erstellen des Geräts: " + error.message);
    return null;
  }

  // LOGGING FÜR FR-08
  if (data) {
    await eventBus.emitChange({
      device_id: data.id,
      action: "Device Created",
      new_value: `Typ: ${type}, Initial-State: ${JSON.stringify(finalState)}`,
      actor_type: 'user',
      user_id: userId || undefined
    });
  }

  return data;
}

export async function deleteDevice(deviceId: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const userId = await getCurrentUserId();

  const roomId = await fetchDeviceRoomId(deviceId);
  if (!roomId) {
    return false;
  }

  const canDelete = await requireOwnerForRoom(roomId, "Geraete loeschen");
  if (!canDelete) {
    return false;
  }

  await eventBus.emitChange({
    device_id: deviceId,
    action: "Device Deleted",
    new_value: "Gerät aus System entfernt",
    actor_type: 'user',
    user_id: userId || undefined,
  });

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

export async function updateDeviceName(
  deviceId: string,
  name: string
): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  const userId = await getCurrentUserId();

  const roomId = await fetchDeviceRoomId(deviceId);
  if (!roomId) {
    return false;
  }

  const canRename = await requireOwnerForRoom(roomId, "Geraete umbenennen");
  if (!canRename) {
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

  await eventBus.emitChange({
    device_id: deviceId,
    action: "Name Changed",
    new_value: `Neuer Name: ${name}`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  return true;
}

export const updateDeviceState = async (
  deviceId: string, 
  newState: DeviceState
) => {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return null;
  }

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('devices')
    .update({ state: newState }) 
    .eq('id', deviceId)
    .select();

  if (error) {
    console.error("Fehler beim Update des Zustands:", error);
    return null;
  }

  if (data) {
    await eventBus.emitChange({
      device_id: deviceId,
      action: "State Change",
      new_value: JSON.stringify(newState),
      actor_type: 'user',
      user_id: userId || undefined,
    });
  }


  // Triggern der Regelprüfung nach Zustandänderung
  if(data) {
    ruleService.checkAndExecuteRulesForDevice(deviceId);
  }

  return data[0];
};


