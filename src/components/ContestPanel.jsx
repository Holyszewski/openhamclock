/**
 * ContestPanel Component
 * Displays upcoming amateur radio contests
 */
import React from 'react';

export const ContestPanel = ({ data, loading }) => {
  return (
    <div className="panel" style={{ padding: '12px' }}>
      <div className="panel-header">🏆 CONTESTS</div>
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
          No upcoming contests
        </div>
      ) : (
        <div style={{ 
          fontSize: '11px', 
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {data.slice(0, 5).map((contest, i) => (
            <div
              key={`${contest.name}-${i}`}
              style={{
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '4px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}
            >
              <div style={{ 
                color: 'var(--accent-cyan)', 
                fontWeight: '600',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {contest.name}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: 'var(--text-muted)',
                fontSize: '10px'
              }}>
                <span>{contest.startDate}</span>
                <span style={{ 
                  color: contest.isActive ? 'var(--accent-green)' : 'var(--text-muted)'
                }}>
                  {contest.isActive ? '● ACTIVE' : contest.timeUntil || ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestPanel;
