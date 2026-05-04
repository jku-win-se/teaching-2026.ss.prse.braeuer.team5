import { useState, useEffect, useCallback } from 'react';
import { ruleService } from '../services/ruleService';
import { supabase } from '../config/supabaseClient';

export const useRules = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [rData, { data: dData }] = await Promise.all([
        ruleService.fetchAllRules(),
        supabase.from('devices').select('id, name, type, room_id, state, rooms(name)'),
      ]);
      setRules(rData);
      setDevices(dData || []);
    } catch (error) {
      console.error("Fehler beim Laden der Regeln:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { rules, devices, loading, refresh: loadData };
};
