import { supabase } from '../config/supabaseClient';
import { type ActivityLog } from '../types';

export const logAction = async (log: Omit<ActivityLog, 'id' | 'created_at'>) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('activity_logs')
    .insert([log]);

  if (error) {
    console.error('Fehler beim Logging:', error.message);
  }
};