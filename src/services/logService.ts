import { supabase } from '../config/supabaseClient';
import { type ActivityLog } from '../types';
import { csvService } from './csvService';

/**
 * Schreibt einen Aktivitätseintrag in die `activity_logs`-Tabelle.
 * Wird von allen Services nach zustandsändernden Operationen aufgerufen.
 * @param payload - Log-Daten ohne `id` und `created_at` (werden von der DB gesetzt).
 */
export async function logAction(payload: Omit<ActivityLog, 'id' | 'created_at'>) {
  if (!supabase) return;

  const { error } = await supabase
    .from('activity_logs')
    .insert([payload]);

  if (error) {
    console.error("Fehler beim Loggen:", error.message);
  }
}

/** Service-Objekt für Lesen, Abonnieren und Exportieren von Aktivitäts-Logs. */
export const logService = {

  /**
   * Lädt die neuesten Aktivitäts-Logs, absteigend nach Erstellungsdatum sortiert.
   * @param limit - Maximale Anzahl zurückgegebener Einträge (Standard: 50).
   * @returns Array von {@link ActivityLog}-Objekten.
   */
  async fetchLogs(limit = 50): Promise<ActivityLog[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },

  /**
   * Abonniert Echtzeit-Inserts in `activity_logs` via Supabase Realtime.
   * @param onNewLog - Callback, der bei jedem neuen Log-Eintrag aufgerufen wird.
   * @returns Der Supabase-Channel (zum Abbestellen via `supabase.removeChannel`)
   *          oder `null` wenn Supabase nicht konfiguriert ist.
   */
  subscribeToLogs(onNewLog: (log: ActivityLog) => void) {
    if (!supabase) return null;
    return supabase
      .channel('activity_updates')
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activity_logs' },
          (payload) => onNewLog(payload.new as ActivityLog)
      )
      .subscribe();
  },

  /**
   * Exportiert alle Aktivitäts-Logs als CSV-Datei (UTF-8 mit BOM für Excel).
   * Spalten: Zeitpunkt, Objekt-Typ, Objekt-ID, Aktion, Details, Akteur.
   */
  async exportToCSV(): Promise<void> {
    if (!supabase) return;

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fehler beim Laden der Exportdaten:", error.message);
      return;
    }

    const headers = ["Zeitpunkt", "Objekt-Typ", "Objekt-ID", "Aktion", "Details", "Akteur"];

    const rows = (logs || []).map(log => [
      new Date(log.created_at).toLocaleString('de-DE'),
      log.device_id ? "Gerät" : "System",
      log.device_id ? `"${log.device_id}"` : "",
      `"${log.action || ''}"`,
      `"${log.new_value || ''}"`,
      `"${log.actor_type || ''}"`
    ]);

    csvService.exportToCSV(headers, rows, "aktivitaetslog_export");
  }
};
