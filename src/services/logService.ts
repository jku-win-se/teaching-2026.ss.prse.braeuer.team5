import { supabase } from '../config/supabaseClient';
import { type ActivityLog } from '../types';
import { csvService } from './csvService';

export async function logAction(payload: Omit<ActivityLog, 'id' | 'created_at'>) {
  if (!supabase) return;
  
  const { error } = await supabase
    .from('activity_logs')
    .insert([payload]);

  if (error) {
    console.error("Fehler beim Loggen:", error.message);
  }
}

export const logService = {
  async fetchLogs(limit = 50): Promise<ActivityLog[]> {
    if (!supabase) return [];
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },

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