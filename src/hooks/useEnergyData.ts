import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabaseClient';
import type { Device, EnergyLog } from '../types';

type DeviceWithRoom = Device & { rooms?: { id: string; name: string } };

export const useEnergyData = (range: 'day' | 'week' = 'day') => {
  const [devices, setDevices] = useState<DeviceWithRoom[]>([]);
  const [history, setHistory] = useState<EnergyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      try {
        setLoading(true);
        const { data: devData } = await supabase
          .from('devices')
          .select('*, rooms(id, name)');

        const startTime = new Date();
        if (range === 'day') {
          startTime.setHours(startTime.getHours() - 24);
        } else {
          startTime.setDate(startTime.getDate() - 7);
        }

        const { data: histData } = await supabase
          .from('energy_logs')
          .select(`
            *,
            devices!inner (
              name,
              rooms!inner (name)
            )
          `)
          .gt('created_at', startTime.toISOString());

        setDevices((devData ?? []) as DeviceWithRoom[]);
        setHistory((histData ?? []) as EnergyLog[]);
      } catch (e) {
        console.error("Fehler beim Laden:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const stats = useMemo(() => {
    const checkIsActive = (d: DeviceWithRoom): boolean => {
      if (!d.state) return false;
      return d.state.on === true;
    };

    const totalLive = devices.reduce((sum, d) =>
      sum + (checkIsActive(d) ? (Number(d.energy_consumption) || 0) : 0), 0);

    const byRoom = devices.reduce((acc: Record<string, number>, d) => {
      const rName = d.rooms?.name;
      if (rName) {
        acc[rName] = (acc[rName] || 0) + (Number(d.energy_consumption) || 0);
      }
      return acc;
    }, {});

    const labels = range === 'day'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    type Slot = { label: string; sum: number; count: number };
    const aggregated: {
      total: Slot[];
      rooms: Record<string, Slot[]>;
      devices: Record<string, Slot[]>;
    } = {
      total: labels.map(l => ({ label: l, sum: 0, count: 0 })),
      rooms: {},
      devices: {}
    };

    history.forEach(log => {
      const date = new Date(log.created_at);
      let idx = -1;

      if (range === 'day') {
        idx = Math.floor(date.getHours() / 4);
      } else {
        idx = (date.getDay() + 6) % 7;
      }

      if (idx !== -1 && idx < labels.length && log.devices?.rooms?.name) {
        const val = Number(log.consumption_watt || 0);
        const rName = log.devices.rooms.name;
        const dName = log.devices.name;

        aggregated.total[idx].sum += val;
        aggregated.total[idx].count++;

        if (!aggregated.rooms[rName]) {
          aggregated.rooms[rName] = labels.map(l => ({ label: l, sum: 0, count: 0 }));
        }
        aggregated.rooms[rName][idx].sum += val;
        aggregated.rooms[rName][idx].count++;

        if (!aggregated.devices[dName]) {
          aggregated.devices[dName] = labels.map(l => ({ label: l, sum: 0, count: 0 }));
        }
        aggregated.devices[dName][idx].sum += val;
        aggregated.devices[dName][idx].count++;
      }
    });

    const MESSUNGEN_PRO_STUNDE = 2;
    const finalize = (slots: Slot[]) => slots.map(s => ({
      label: s.label,
      value: s.count > 0 ? Math.round(s.sum / MESSUNGEN_PRO_STUNDE) : 0
    }));

    return {
      totalLive,
      byRoom,
      historyChart: finalize(aggregated.total),
      roomCharts: Object.fromEntries(
        Object.entries(aggregated.rooms).map(([k, v]) => [k, finalize(v)])
      ),
      deviceCharts: Object.fromEntries(
        Object.entries(aggregated.devices).map(([k, v]) => [k, finalize(v)])
      ),
      byDevice: devices.map(d => ({
        ...d,
        isActive: checkIsActive(d),
        consumption: Number(d.energy_consumption) || 0
      }))
    };
  }, [devices, history, range]);

  return { ...stats, loading };
};
