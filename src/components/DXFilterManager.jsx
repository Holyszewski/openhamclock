/**
 * DXFilterManager Component
 * Modal for DX cluster filtering (zones, bands, modes, watchlist)
 */
import React, { useState } from 'react';
import { HF_BANDS, CONTINENTS, MODES } from '../utils/callsign.js';

export const DXFilterManager = ({ filters, onFilterChange, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('zones');
  const [newWatchlistCall, setNewWatchlistCall] = useState('');
  const [newExcludeCall, setNewExcludeCall] = useState('');
  
  // CQ Zones (1-40)
  const cqZones = Array.from({ length: 40 }, (_, i) => i + 1);
  
  // ITU Zones (1-90)
  const ituZones = Array.from({ length: 90 }, (_, i) => i + 1);
  
  // Toggle functions
  const toggleArrayItem = (key, item) => {
    const current = filters?.[key] || [];
    const newArray = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    onFilterChange({ ...filters, [key]: newArray.length > 0 ? newArray : undefined });
  };
  
  const selectAllZones = (type, zones) => {
    onFilterChange({ ...filters, [type]: [...zones] });
  };
  
  const clearZones = (type) => {
    onFilterChange({ ...filters, [type]: undefined });
  };
  
  const addToWatchlist = () => {
    if (!newWatchlistCall.trim()) return;
    const current = filters?.watchlist || [];
    const call = newWatchlistCall.toUpperCase().trim();
    if (!current.includes(call)) {
      onFilterChange({ ...filters, watchlist: [...current, call] });
    }
    setNewWatchlistCall('');
  };
  
  const removeFromWatchlist = (call) => {
    const current = filters?.watchlist || [];
    onFilterChange({ ...filters, watchlist: current.filter(c => c !== call) });
  };
  
  const addToExclude = () => {
    if (!newExcludeCall.trim()) return;
    const current = filters?.excludeList || [];
    const call = newExcludeCall.toUpperCase().trim();
    if (!current.includes(call)) {
      onFilterChange({ ...filters, excludeList: [...current, call] });
    }
    setNewExcludeCall('');
  };
  
  const removeFromExclude = (call) => {
    const current = filters?.excludeList || [];
    onFilterChange({ ...filters, excludeList: current.filter(c => c !== call) });
  };
  
  const clearAllFilters = () => {
    onFilterChange({});
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.cqZones?.length) count++;
    if (filters?.ituZones?.length) count++;
    if (filters?.continents?.length) count++;
    if (filters?.bands?.length) count++;
    if (filters?.modes?.length) count++;
    if (filters?.watchlist?.length) count++;
    if (filters?.excludeList?.length) count++;
    if (filters?.callsign) count++;
    if (filters?.watchlistOnly) count++;
    return count;
  };
  
  if (!isOpen) return null;
  
  const tabStyle = (active) => ({
    padding: '8px 16px',
    background: active ? 'var(--accent-cyan)' : 'transparent',
    color: active ? '#000' : 'var(--text-secondary)',
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontFamily: 'JetBrains Mono',
    fontSize: '11px',
    fontWeight: active ? '700' : '400'
  });
  
  const pillStyle = (active) => ({
    padding: '4px 10px',
    background: active ? 'rgba(0, 255, 136, 0.3)' : 'rgba(60,60,60,0.5)',
    border: `1px solid ${active ? '#00ff88' : '#444'}`,
    color: active ? '#00ff88' : '#888',
    borderRadius: '4px',
    fontSize: '10px',
    cursor: 'pointer',
    fontFamily: 'JetBrains Mono',
    transition: 'all 0.15s'
  });
  
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--accent-cyan)' }}>🔍 DX Cluster Filters</h2>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clearAllFilters} style={{
              padding: '8px 16px',
              background: 'rgba(255, 100, 100, 0.2)',
              border: '1px solid #ff6666',
              color: '#ff6666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px'
            }}>
              Clear All
            </button>
            <button onClick={onClose} style={{
              padding: '8px 16px',
              background: 'var(--accent-cyan)',
              border: 'none',
              color: '#000',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px'
            }}>
              Done
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 20px' }}>
          {['zones', 'bands', 'modes', 'watchlist'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
          {activeTab === 'zones' && (
            <div>
              {/* CQ Zones */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '600' }}>CQ Zones</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => selectAllZones('cqZones', cqZones)} style={{ ...pillStyle(false), fontSize: '9px' }}>Select All</button>
                    <button onClick={() => clearZones('cqZones')} style={{ ...pillStyle(false), fontSize: '9px' }}>Clear</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {cqZones.map(zone => (
                    <button key={zone} onClick={() => toggleArrayItem('cqZones', zone)} style={{ ...pillStyle(filters?.cqZones?.includes(zone)), width: '36px', textAlign: 'center' }}>
                      {zone}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Continents */}
              <div>
                <div style={{ fontWeight: '600', marginBottom: '10px' }}>Continents</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CONTINENTS.map(({ code, name }) => (
                    <button key={code} onClick={() => toggleArrayItem('continents', code)} style={{ ...pillStyle(filters?.continents?.includes(code)), padding: '8px 16px' }}>
                      {code} - {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'bands' && (
            <div>
              <div style={{ fontWeight: '600', marginBottom: '10px' }}>Select bands to show</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {HF_BANDS.map(band => (
                  <button key={band} onClick={() => toggleArrayItem('bands', band)} style={{ ...pillStyle(filters?.bands?.includes(band)), padding: '10px 20px', fontSize: '12px' }}>
                    {band}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'modes' && (
            <div>
              <div style={{ fontWeight: '600', marginBottom: '10px' }}>Select modes to show</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MODES.map(mode => (
                  <button key={mode} onClick={() => toggleArrayItem('modes', mode)} style={{ ...pillStyle(filters?.modes?.includes(mode)), padding: '10px 20px', fontSize: '12px' }}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'watchlist' && (
            <div>
              {/* Watchlist Only Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters?.watchlistOnly || false}
                    onChange={e => onFilterChange({ ...filters, watchlistOnly: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '600' }}>Show ONLY watchlist callsigns</span>
                </label>
              </div>
              
              {/* Add to Watchlist */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: '600', marginBottom: '10px' }}>Watchlist (highlight these calls)</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newWatchlistCall}
                    onChange={e => setNewWatchlistCall(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addToWatchlist()}
                    placeholder="Add callsign..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <button onClick={addToWatchlist} style={{ ...pillStyle(true), padding: '8px 16px' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(filters?.watchlist || []).map(call => (
                    <span key={call} style={{
                      padding: '4px 10px',
                      background: 'rgba(0, 255, 136, 0.2)',
                      border: '1px solid var(--accent-green)',
                      borderRadius: '4px',
                      color: 'var(--accent-green)',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {call}
                      <button onClick={() => removeFromWatchlist(call)} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px'
                      }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Exclude List */}
              <div>
                <div style={{ fontWeight: '600', marginBottom: '10px' }}>Exclude List (hide these calls)</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newExcludeCall}
                    onChange={e => setNewExcludeCall(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addToExclude()}
                    placeholder="Add callsign..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <button onClick={addToExclude} style={{ ...pillStyle(false), padding: '8px 16px', borderColor: '#ff6666', color: '#ff6666' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(filters?.excludeList || []).map(call => (
                    <span key={call} style={{
                      padding: '4px 10px',
                      background: 'rgba(255, 100, 100, 0.2)',
                      border: '1px solid var(--accent-red)',
                      borderRadius: '4px',
                      color: 'var(--accent-red)',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {call}
                      <button onClick={() => removeFromExclude(call)} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px'
                      }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DXFilterManager;
