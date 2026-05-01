import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { type ActivityLog } from '../types';
import './ActivityLog.css';

const ActivityLogTable: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs(data || []);
    };

    fetchLogs();

    const channel = supabase?.channel('activity_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'activity_logs' 
      }, 
      (payload) => {
        setLogs((prev) => [payload.new as ActivityLog, ...prev]);
      }).subscribe();

    return () => { 
      if (channel) supabase?.removeChannel(channel); 
    };
  }, []);

  return (
    <div className="log-container">
      <div className="log-header">
        <h2>System-Aktivitäten</h2>
      </div>
      
      <div className="table-responsive">
        <table className="log-table">
          <thead>
            <tr>
              <th>Zeitpunkt</th>
              <th>Objekt</th>
              <th>Aktion</th>
              <th>Details</th>
              <th>Akteur</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('de-DE', {
                    day: '2-digit', 
                    month: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })} Uhr
                </td>
                
                <td>
                  <div className="object-cell">
                    {log.device_id ? (
                      <>
                        <b style={{ color: '#2563eb' }}>Gerät</b>
                        <span className="text-id">{log.device_id.slice(0, 8)}</span>
                      </>
                    ) : log.room_id ? (
                      <>
                        <b style={{ color: '#7c3aed' }}>Raum</b>
                        <span className="text-id">{log.room_id.slice(0, 8)}</span>
                      </>
                    ) : (
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>System</span>
                    )}
                  </div>
                </td>

                <td><strong className="action-text">{log.action}</strong></td>
                <td><code className="details-code">{log.new_value}</code></td>
                <td>
                  <span className={`badge ${log.actor_type === 'user' ? 'badge-user' : 'badge-system'}`}>
                    {log.actor_type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogTable;