/**
 * SettingsPanel Component
 * Modal for app configuration (callsign, location, theme, layout)
 */
import React, { useState, useEffect } from 'react';

export const SettingsPanel = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState({
    callsign: '',
    lat: '',
    lon: '',
    theme: 'dark',
    layout: 'modern'
  });

  useEffect(() => {
    if (config) {
      setFormData({
        callsign: config.callsign || 'N0CALL',
        lat: config.location?.lat?.toString() || '40.0150',
        lon: config.location?.lon?.toString() || '-105.2705',
        theme: config.theme || 'dark',
        layout: config.layout || 'modern'
      });
    }
  }, [config, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newConfig = {
      ...config,
      callsign: formData.callsign.toUpperCase().trim() || 'N0CALL',
      location: {
        lat: parseFloat(formData.lat) || 40.0150,
        lon: parseFloat(formData.lon) || -105.2705
      },
      theme: formData.theme,
      layout: formData.layout
    };
    onSave(newConfig);
    onClose();
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(4),
            lon: position.coords.longitude.toFixed(4)
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, monospace'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    fontWeight: '500'
  };

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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--accent-cyan)' }}>⚙ Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Callsign */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Callsign</label>
            <input
              type="text"
              value={formData.callsign}
              onChange={e => setFormData(prev => ({ ...prev, callsign: e.target.value }))}
              style={inputStyle}
              placeholder="W1ABC"
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, margin: 0 }}>Location</label>
              <button
                type="button"
                onClick={handleGeolocate}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-cyan)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                📍 Use My Location
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <input
                  type="text"
                  value={formData.lat}
                  onChange={e => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                  style={inputStyle}
                  placeholder="Latitude"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.lon}
                  onChange={e => setFormData(prev => ({ ...prev, lon: e.target.value }))}
                  style={inputStyle}
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Theme</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['dark', 'light', 'legacy'].map(theme => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, theme }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: formData.theme === theme ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                    border: `1px solid ${formData.theme === theme ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                    borderRadius: '6px',
                    color: formData.theme === theme ? '#000' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: formData.theme === theme ? '600' : '400',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {theme === 'legacy' ? '🖥 Legacy' : theme === 'dark' ? '🌙 Dark' : '☀ Light'}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Layout</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['modern', 'legacy'].map(layout => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, layout }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: formData.layout === layout ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    border: `1px solid ${formData.layout === layout ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    borderRadius: '6px',
                    color: formData.layout === layout ? '#000' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: formData.layout === layout ? '600' : '400',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {layout === 'modern' ? '✨ Modern' : '📺 Classic'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--accent-green)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
