import { supabase } from '../config/supabaseClient';

/** Service-Objekt für Energieverbrauchsdaten. */
export const energyService = {

  /**
   * Lädt den aktuellen Energieverbrauch aller Geräte inkl. Raumzuordnung.
   * Gibt für jedes Gerät `id`, `name`, `type`, `energy_consumption` und
   * den zugehörigen Raumnamen zurück.
   * @returns Array von Gerätezeilen mit Raumdaten.
   * @throws Wenn Supabase nicht konfiguriert ist oder ein DB-Fehler auftritt.
   */
  async getLiveConsumption() {
    if (!supabase) throw new Error("Supabase client is not initialized");
    const { data, error } = await supabase
      .from('devices')
      .select(`
        id,
        name,
        type,
        energy_consumption,
        rooms (name)
      `);

    if (error) throw error;
    return data || [];
  }
};
