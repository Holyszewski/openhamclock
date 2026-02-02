/**
 * POTAPanel Component
 * Displays Parks on the Air activations
 */
import React from 'react';

export const POTAPanel = ({ data, loading }) => {
  return (
    <div className="panel" style={{ padding: '12px' }}>
      <div className="panel-header">🌲 POTA ACTIVATIONS</div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <div className="loading-spinner" />
        </div>
      ) : data.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          No active POTA spots
        </div>
      ) : (
        <div style={{ 
          fontSize: '11px', 
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {data.slice(0, 5).map((spot, i) => (
            <div
              key={`${spot.call}-${spot.ref}-${i}`}
              style={{
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '4px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                  {spot.call}
                </span>
                <span style={{ color: 'var(--accent-amber)' }}>
                  {spot.freq} {spot.mode}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: 'var(--text-muted)',
                fontSize: '10px'
              }}>
                <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: '70%'
                }}>
                  {spot.ref} - {spot.name}
                </span>
                <span>{spot.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POTAPanel;
