import { supabase } from '../config/supabaseClient';
import { type ActivityLog } from '../types';

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
  }
};