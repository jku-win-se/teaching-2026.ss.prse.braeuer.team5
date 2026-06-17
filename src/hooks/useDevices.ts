import { useState, useEffect } from "react";
import { type Device, type DeviceType, type DeviceState } from "../types";
import { fetchDevices, addDeviceToRoom, deleteDevice, updateDeviceName, updateDeviceState } from "../services/deviceService";
import { supabase } from "../config/supabaseClient";

/**
 * React-Hook zur Verwaltung der Geräteliste eines Raums.
 *
 * Lädt Geräte beim initialen Render und abonniert Supabase-Realtime-Events
 * (UPDATE auf `devices` gefiltert nach `room_id`), um externe Zustandsänderungen
 * (z. B. durch Szenen-Aktivierung oder andere Clients) sofort anzuzeigen.
 * Die Supabase-Subscription wird beim Unmount automatisch bereinigt.
 *
 * @param roomId - UUID des Raums. Bei `undefined` wird kein Laden angestoßen.
 * @returns
 * - `devices` – Array der aktuellen {@link Device}-Objekte
 * - `loading` – `true` während des initialen Ladevorgangs
 * - `addDevice` – Erstellt ein neues Gerät im Raum
 * - `removeDevice` – Löscht ein Gerät; gibt `true` bei Erfolg zurück
 * - `renameDevice` – Benennt ein Gerät um
 * - `toggleDevice` – Schaltet ein Gerät ein/aus (mit optimistischem Update)
 * - `changeDeviceState` – Aktualisiert beliebige Zustandsfelder (mit optimistischem Update)
 */
export function useDevices(roomId: string | undefined) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    let isCancelled = false;

    const loadDevices = async () => {
      setLoading(true);
      const loadedDevices = await fetchDevices(roomId);
      if (isCancelled) return;
      setDevices(loadedDevices);
      setLoading(false);
    };

    void loadDevices();

    // Realtime: externe Zustandsänderungen (z.B. Szenen-Aktivierung) sofort anzeigen
    const channel = supabase
      ?.channel(`devices_room_${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "devices", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setDevices((current) =>
            current.map((d) => d.id === payload.new.id ? { ...d, ...(payload.new as Device) } : d)
          );
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      if (channel) supabase?.removeChannel(channel);
    };
  }, [roomId]);

  /**
   * Erstellt ein neues Gerät im Raum und fügt es der lokalen Liste hinzu.
   * @param deviceName - Anzeigename des neuen Geräts.
   * @param type - Gerätetyp.
   * @param energyConsumption - Leistungsaufnahme in Watt (oder `null`).
   */
  const addDevice = async (deviceName: string, type: DeviceType, energyConsumption: number | null) => {
    if (!roomId) return;
    const newDevice = await addDeviceToRoom(roomId, deviceName, type, energyConsumption);
    if (newDevice) {
      setDevices((current) => [...current, newDevice]);
    }
  };

  /**
   * Löscht ein Gerät und entfernt es aus der lokalen Liste.
   * @param deviceId - UUID des zu löschenden Geräts.
   * @returns `true` bei Erfolg.
   */
  const removeDevice = async (deviceId: string) => {
    const success = await deleteDevice(deviceId);
    if (success) {
      setDevices((current) => current.filter((d) => d.id !== deviceId));
    }
    return success;
  };

  /**
   * Benennt ein Gerät um und aktualisiert die lokale Liste.
   * @param deviceId - UUID des Geräts.
   * @param newName - Neuer Anzeigename.
   */
  const renameDevice = async (deviceId: string, newName: string) => {
    const success = await updateDeviceName(deviceId, newName);
    if (success) {
      setDevices((current) =>
        current.map((d) => (d.id === deviceId ? { ...d, name: newName } : d))
      );
    }
  };

  /**
   * Schaltet ein Gerät ein oder aus. Aktualisiert den lokalen State optimistisch
   * und delegiert dann an {@link changeDeviceState}.
   * @param deviceId - UUID des Geräts.
   * @param newOn - `true` = einschalten, `false` = ausschalten.
   */
  const toggleDevice = async (deviceId: string, newOn: boolean) => {
    setDevices((current) =>
      current.map((d) =>
        d.id === deviceId ? { ...d, state: { ...d.state, on: newOn } } : d
      )
    );
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      await changeDeviceState(deviceId, { ...device.state, on: newOn });
    }
  };

  /**
   * Aktualisiert beliebige Zustandsfelder eines Geräts (Partial-Merge).
   * Aktualisiert den lokalen State optimistisch und persistiert via
   * {@link updateDeviceState} (löst danach Regelprüfung aus).
   * @param deviceId - UUID des Geräts.
   * @param newState - Teilweiser neuer Zustand (wird mit bestehendem State gemergt).
   */
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
