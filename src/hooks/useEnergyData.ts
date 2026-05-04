import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabaseClient';

interface ChartEntry { label: string; value: number; count: number; }

export const useEnergyData = (range: 'day' | 'week' = 'day') => {
  const [devices, setDevices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      try {
        setLoading(true);
        const { data: devData } = await supabase.from('devices').select('*, rooms(name)');
        
        const startTime = new Date();
        if (range === 'day') {
          startTime.setHours(startTime.getHours() - 24);
        } else {
          startTime.setDate(startTime.getDate() - 7);
        }

        const { data: histData } = await supabase
          .from('energy_logs')
          .select('created_at, consumption_watt')
          .gt('created_at', startTime.toISOString());

        setDevices(devData || []);
        setHistory(histData || []);
      } catch (e) {
        console.error("Fehler:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const stats = useMemo(() => {
    const totalLive = devices.reduce((sum, d) => sum + (Number(d.energy_consumption) || 0), 0);
    const byRoom = devices.reduce((acc: any, d) => {
      const rName = d.rooms?.name || 'Unbekannt';
      acc[rName] = (acc[rName] || 0) + (Number(d.energy_consumption) || 0);
      return acc;
    }, {});

    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const chartData: ChartEntry[] = (range === 'day' 
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] 
      : days).map(l => ({ label: l, value: 0, count: 0 }));

    history.forEach(log => {
      const date = new Date(log.created_at);
      let idx = -1;

      if (range === 'day') {
        idx = Math.min(Math.floor(date.getHours() / 4), 5);
      } else {
        idx = date.getDay() - 1; 
        if (idx === -1) idx = 6;
      }

      if (idx !== -1 && chartData[idx]) {
        chartData[idx].value += Number(log.consumption_watt || 0);
        chartData[idx].count += 1;
      }
    });

    const averageChartData = chartData.map(entry => ({
      label: entry.label,
      value: entry.count > 0 ? Math.round(entry.value / entry.count) : 0
    }));

    return { 
      totalLive, 
      byRoom, 
      historyChart: averageChartData, 
      byDevice: devices.map(d => ({ name: d.name, room: d.rooms?.name, consumption: d.energy_consumption })) 
    };
  }, [devices, history, range]);

  return { ...stats, loading };
};