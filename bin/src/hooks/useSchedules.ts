import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { supabase } from '../config/supabaseClient';
import type { Schedule } from '../types';

export type ScheduleDevice = {
  id: string;
  name: string;
  type: string;
  room_id: string;
  rooms?: { name: string };
};

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<ScheduleDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [sData, { data: dData }] = await Promise.all([
        scheduleService.fetchAllSchedules(),
        supabase.from('devices').select(`id, name, type, room_id, rooms (name)`)
      ]);
      setSchedules(sData as Schedule[]);
      setDevices((dData ?? []) as unknown as ScheduleDevice[]);
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
