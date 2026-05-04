import { useState, useEffect, useCallback } from 'react';
import { ruleService } from '../services/ruleService';
import { supabase } from '../config/supabaseClient';
import type { Rule, Device } from '../types';

export const useRules = () => {
 const [rules, setRules] = useState<Rule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
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

  // ✅ NEU: gezieltes Update
  const toggleRuleLocal = useCallback((id: string, isActive: boolean) => {
    setRules(prev =>
      prev.map(r =>
        r.id === id ? { ...r, is_active: isActive } : r
      )
    );
  }, []);

  return {
    rules,
    devices,
    loading,
    refresh: loadData,
    toggleRuleLocal, 
  };
};