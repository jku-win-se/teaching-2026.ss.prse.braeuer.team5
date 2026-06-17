import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient";
import { logAction } from "./logService";
import type { Device, DeviceType, DeviceState } from "../types";
import { fetchRoomRole } from "./roomService";
import { ruleService } from "./ruleService";

/**
 * Gibt die UUID des aktuell authentifizierten Nutzers zurück.
 * @returns Nutzer-UUID oder `null` wenn keine Session vorhanden ist.
 */
async function getCurrentUserId(): Promise<string | null> {
  return (await supabase?.auth.getUser())?.data?.user?.id ?? null;
}

/**
 * Prüft, ob der aktuelle Nutzer Owner des Raums ist.
 * Zeigt einen Alert an, wenn die Berechtigung fehlt.
 * @param roomId - UUID des Raums.
 * @param actionLabel - Aktionsbeschreibung für die Alert-Meldung.
 * @returns `true` wenn Owner, sonst `false`.
 */
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

/**
 * Gibt die `room_id` eines Geräts zurück.
 * @param deviceId - UUID des Geräts.
 * @returns UUID des Raums oder `null` bei Fehler.
 */
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

/**
 * Lädt alle Geräte eines Raums aus der Datenbank.
 * @param roomId - UUID des Raums.
 * @returns Array von {@link Device}-Objekten oder leeres Array bei Fehler.
 */
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

/**
 * Erstellt ein neues Gerät in einem Raum (nur für Owner).
 * Setzt gerätetyp-spezifische Standardzustände, wenn kein `initialState` angegeben wird.
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param roomId - UUID des Raums.
 * @param name - Anzeigename des Geräts.
 * @param type - Gerätetyp (bestimmt den Initialzustand).
 * @param energy_consumption - Leistungsaufnahme in Watt (optional).
 * @param initialState - Überschreibt den gerätetyp-spezifischen Standardzustand.
 * @returns Das erstellte {@link Device} oder `null` bei Fehler.
 */
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
    await logAction({
      device_id: data.id,
      action: "Device Created",
      new_value: `Typ: ${type}, Initial-State: ${JSON.stringify(finalState)}`,
      actor_type: 'user',
      user_id: userId || undefined,
    });
  }

  return data;
}

/**
 * Löscht ein Gerät (nur für Owner des zugehörigen Raums).
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param deviceId - UUID des zu löschenden Geräts.
 * @returns `true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
 */
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

  await logAction({
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

/**
 * Benennt ein Gerät um (nur für Owner des zugehörigen Raums).
 * Schreibt einen Aktivitäts-Log-Eintrag.
 * @param deviceId - UUID des Geräts.
 * @param name - Neuer Anzeigename.
 * @returns `true` bei Erfolg, `false` bei fehlendem Owner-Recht oder DB-Fehler.
 */
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

  await logAction({
    device_id: deviceId,
    action: "Name Changed",
    new_value: `Neuer Name: ${name}`,
    actor_type: 'user',
    user_id: userId || undefined,
  });

  return true;
}

/**
 * Aktualisiert den Zustand eines Geräts in der Datenbank.
 * Schreibt einen Aktivitäts-Log-Eintrag und löst anschließend asynchron
 * die Regelprüfung via {@link ruleService.checkAndExecuteRulesForDevice} aus.
 * @param deviceId - UUID des Geräts.
 * @param newState - Vollständiger neuer Gerätezustand.
 * @returns Das aktualisierte {@link Device} oder `null` bei Fehler.
 */
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
    await logAction({
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


