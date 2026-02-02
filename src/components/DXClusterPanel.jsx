/**
 * DXClusterPanel Component
 * Displays DX cluster spots with filtering controls
 */
import React from 'react';
import { getBandColor } from '../utils/callsign.js';

export const DXClusterPanel = ({ 
  data, 
  loading, 
  totalSpots,
  filters,
  onOpenFilters,
  onHoverSpot,
  hoveredSpot 
}) => {
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

  const filterCount = getActiveFilterCount();

  return (
    <div className="panel" style={{ 
      padding: '12px', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with filter button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div className="panel-header" style={{ margin: 0 }}>
          📻 DX CLUSTER
          <span style={{ 
            fontSize: '10px', 
            color: 'var(--text-muted)', 
            fontWeight: '400',
            marginLeft: '8px'
          }}>
            {data.length}/{totalSpots || 0}
          </span>
        </div>
        <button
          onClick={onOpenFilters}
          style={{
            background: filterCount > 0 ? 'rgba(0, 221, 255, 0.15)' : 'var(--bg-tertiary)',
            border: `1px solid ${filterCount > 0 ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
            color: filterCount > 0 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          🔍 {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
        </button>
      </div>

      {/* Spots list */}
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
          {filterCount > 0 ? 'No spots match filters' : 'No spots available'}
        </div>
      ) : (
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {data.slice(0, 15).map((spot, i) => {
            const freq = parseFloat(spot.freq);
            const color = getBandColor(freq / 1000); // Convert kHz to MHz for color
            const isHovered = hoveredSpot?.call === spot.call && 
                             Math.abs(parseFloat(hoveredSpot?.freq) - freq) < 1;
            
            return (
              <div
                key={`${spot.call}-${spot.freq}-${i}`}
                onMouseEnter={() => onHoverSpot?.(spot)}
                onMouseLeave={() => onHoverSpot?.(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  marginBottom: '2px',
                  background: isHovered ? 'rgba(68, 136, 255, 0.2)' : (i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ color, fontWeight: '600' }}>
                  {(freq / 1000).toFixed(3)}
                </div>
                <div style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {spot.call}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {spot.time || ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DXClusterPanel;
