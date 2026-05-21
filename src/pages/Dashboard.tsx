import React, { useState } from 'react';
import { useEnergyData } from '../hooks/useEnergyData';
import './Dashboard.css';

const EnergyDashboard: React.FC = () => {
  const [range, setRange] = useState<'day' | 'week'>('day');
  const [filter, setFilter] = useState({ type: 'all', id: '' });
  
  const { 
    totalLive, 
    historyChart, 
    roomCharts, 
    deviceCharts, 
    byDevice, 
    byRoom, 
    loading 
  } = useEnergyData(range);

  const getDisplayData = () => {
    if (filter.type === 'room') return roomCharts[filter.id] || [];
    if (filter.type === 'device') return deviceCharts[filter.id] || [];
    return historyChart;
  };

  const displayData = getDisplayData();
  
  const dataValues = displayData.map((d) => d.value);
  const maxValueInData = Math.max(...dataValues, 0);
  const dynamicMax = maxValueInData > 0 ? maxValueInData * 1.2 : 100;

  if (loading) return <div className="ed-loading">Daten werden geladen...</div>;

  return (
    <div className="energy-dashboard-root">
      <header className="ed-header">
        <div>
          <h1>Energie-Dashboard</h1>
          <p className="ed-live-badge">
            <span className="pulse-dot"></span>
            {totalLive} W Aktuell
          </p>
        </div>

        <div className="ed-controls">
          <div className="ed-filter-select">
  <select 
    className="ed-styled-select"
    value={`${filter.type}:${filter.id}`} 
    onChange={(e) => {
      const [type, id] = e.target.value.split(':');
      setFilter({ type, id: id || '' });
    }}
  >

    <option value="all:">Gesamtes Haus</option>
    
    <optgroup label="Räume">
      {Object.keys(roomCharts).map(room => (
        <option key={room} value={`room:${room}`}>
          {room}
        </option>
      ))}
    </optgroup>

    <optgroup label="Geräte">
      {Object.keys(deviceCharts).map(device => (
        <option key={device} value={`device:${device}`}>
          {device}
        </option>
      ))}
    </optgroup>
  </select>
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
        </div>
      </header>

      <div className="ed-grid">
        <section className="ed-card">
          <h3>Verbrauch nach Raum</h3>
          <div className="ed-room-list">
            {Object.entries(byRoom || {}).map(([name, watt]: [string, number]) => (
              <div key={name} className="ed-room-item">
                <div className="ed-room-info">
                  <span>{name}</span>
                  <span className="ed-watt-value">{watt} W</span>
                </div>
                <div className="ed-progress-bar">
                  <div 
                    className="ed-progress-fill" 
                    style={{ width: `${Math.min((watt / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ed-card">
          <h3>Verlauf {range === 'day' ? '(24h)' : '(Woche)'} 
            {filter.id && <span className="ed-filter-tag"> - {filter.id}</span>}
          </h3>
          <div className="ed-chart-area">
            {displayData.map((entry, i) => {
              const height = maxValueInData > 0 ? (entry.value / dynamicMax) * 100 : 0;

              return (
                <div key={i} className="ed-chart-column">
                  <div className="ed-bar-container">
                    <div 
                      className="ed-bar" 
                      style={{ 
                        height: `${height}%`,
                        transition: 'height 0.3s ease-in-out'
                      }}
                    >
                      {entry.value > 0 && (
                        <span className="ed-bar-tooltip">{entry.value} Wh</span>
                      )}
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
                <th>Status</th>
                <th>Raum</th>
                <th style={{ textAlign: 'right' }}>Verbrauch</th>
              </tr>
            </thead>
            <tbody>
              {byDevice.map((device, i) => (
                <tr key={i}>
                  <td>{device.name}</td>
                  <td>
                    <span className={`ed-status-pill ${device.isActive ? 'on' : 'off'}`}>
                      {device.isActive ? 'AN' : 'AUS'}
                    </span>
                  </td>
                  <td>
                    <span className="ed-room-tag">{device.rooms?.name || 'Kein Raum'}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {device.consumption} W
                  </td>
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