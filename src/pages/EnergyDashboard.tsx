import React, { useState } from 'react';
import { useEnergyData } from '../hooks/useEnergyData';
import './EnergyDashboard.css';

const EnergyDashboard: React.FC = () => {
  const [range, setRange] = useState<'day' | 'week'>('week');
  const { totalLive, byRoom, byDevice, historyChart, loading } = useEnergyData(range);

  if (loading) return <div className="loading">Lade Energiedaten...</div>;

  const MAX_WATT = 100;

  return (
    <div className="energy-dashboard-root">
      <header className="ed-header">
        <div>
          <h1>Energie-Dashboard</h1>
          <p className="ed-live-indicator">
            <span className="ed-dot"></span> {totalLive} W Aktuell
          </p>
        </div>
        <div className="ed-range-picker">
  <button 
    className={`ed-button ${range === 'day' ? 'active' : ''}`} 
    onClick={() => setRange('day')}
  >
    Tag
  </button>
  <button 
    className={`ed-button ${range === 'week' ? 'active' : ''}`} 
    onClick={() => setRange('week')}
  >
    Woche
  </button>
</div>
      </header>

      <div className="ed-grid">
        <section className="ed-card">
          <h3>Verbrauch nach Raum</h3>
          <div className="ed-room-list">
            {Object.entries(byRoom).map(([room, consumption]) => (
              <div key={room} className="ed-room-item">
                <div className="ed-room-info">
                  <span>{room}</span>
                  <span>{consumption as number} W</span>
                </div>
                <div className="ed-progress-bar">
                  <div 
                    className="ed-progress-fill" 
                    style={{ width: `${Math.min(((consumption as number) / totalLive) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ed-card">
          <h3>Verlauf ({range === 'day' ? '24h' : 'Woche'})</h3>
          <div className="ed-chart-area">
            {historyChart.map((entry) => {
              const barHeight = Math.min((entry.value / MAX_WATT) * 100, 100);
              return (
                <div key={entry.label} className="ed-chart-column">
                  <div className="ed-bar-container">
                    <div className="ed-bar" style={{ height: `${barHeight}%` }}>
                      {entry.value > 0 && <span className="ed-bar-tooltip">{entry.value}W</span>}
                    </div>
                  </div>
                  <span className="ed-bar-label">{entry.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ed-card ed-full-width">
          <h3>Einzelne Geräte</h3>
          <table className="ed-device-table">
            <thead>
              <tr>
                <th>Gerät</th>
                <th>Raum</th>
                <th style={{ textAlign: 'right' }}>Verbrauch</th>
              </tr>
            </thead>
            <tbody>
              {byDevice.map((device, idx) => (
                <tr key={idx}>
                  <td>{device.name}</td>
                  <td><span className="ed-room-tag">{device.room}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#3b82f6' }}>{device.consumption} W</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default EnergyDashboard;