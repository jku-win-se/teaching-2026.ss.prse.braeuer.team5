import { useState, useEffect, useCallback } from 'react';
import { ruleService } from '../services/ruleService';
import { supabase } from '../config/supabaseClient';
import type { Rule, DeviceWithRoom } from '../types';

/**
 * React-Hook zum Laden und Verwalten von Automatisierungsregeln.
 *
 * Lädt beim initialen Render alle Regeln und alle verfügbaren Geräte
 * (mit Raumzuordnung) parallel.
 *
 * @returns
 * - `rules` – Array aller {@link Rule}-Objekte
 * - `devices` – Array aller {@link DeviceWithRoom}-Objekte (für Trigger/Aktion-Auswahl)
 * - `loading` – `true` während des Ladevorgangs
 * - `refresh` – Lädt alle Daten erneut aus der Datenbank
 * - `toggleRuleLocal` – Ändert `is_active` nur im lokalen State (kein DB-Call;
 *   für optimistische Updates nach einem bereits gesendeten DB-Toggle)
 */
export const useRules = () => {
 const [rules, setRules] = useState<Rule[]>([]);
  const [devices, setDevices] = useState<DeviceWithRoom[]>([]);
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
      setDevices((dData as unknown as DeviceWithRoom[]) || []);
    } catch (error) {
      console.error("Fehler beim Laden der Regeln:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Aktualisiert den `is_active`-Status einer Regel ausschließlich im lokalen State.
   * Kein Datenbankaufruf – muss nach einem DB-Toggle aufgerufen werden um die UI
   * konsistent zu halten.
   * @param id - UUID der Regel.
   * @param isActive - Neuer Aktiv-Status.
   */
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
