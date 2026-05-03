import React, { useEffect, useState } from 'react';
import { logService } from '../services/logService';
import { type ActivityLog } from '../types';
import { supabase } from '../config/supabaseClient';
import './ActivityLog.css';

const ActivityLogTable: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    logService.fetchLogs().then(setLogs);

    const channel = logService.subscribeToLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev]);
    });

    return () => { 
      if (channel) supabase?.removeChannel(channel); 
    };
  }, []);

  return (
    <div className="log-container">
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
          <td className="timestamp-cell">
            {new Date(log.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </td>
          <td>
            <span className="object-type">{log.device_id ? 'Gerät' : 'System'}</span>
            {log.device_id && <span className="object-id">{log.device_id.substring(0, 8)}</span>}
          </td>
          <td>
            <span className="action-text">{log.action}</span>
          </td>
          <td className="details-cell">
            {log.new_value}
          </td>
          <td>
            <span className={log.actor_type.includes('system') ? 'badge-system' : 'badge-user'}>
              {log.actor_type}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default ActivityLogTable;