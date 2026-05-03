import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { supabase } from '../config/supabaseClient';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [sData, { data: dData }] = await Promise.all([
        scheduleService.fetchAllSchedules(),
        supabase.from('devices').select(`id, name, type, room_id, rooms (name)`)
      ]);
      setSchedules(sData);
      setDevices(dData || []);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { schedules, devices, loading, refresh: loadData };
};