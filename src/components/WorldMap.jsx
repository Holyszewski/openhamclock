/**
 * WorldMap Component
 * Leaflet map with DE/DX markers, terminator, DX paths, POTA, satellites
 */
import React, { useRef, useEffect, useState } from 'react';
import { MAP_STYLES } from '../utils/config.js';
import { 
  calculateGridSquare, 
  getSunPosition, 
  getMoonPosition, 
  getGreatCirclePoints 
} from '../utils/geo.js';
import { filterDXPaths, getBandColor } from '../utils/callsign.js';

export const WorldMap = ({ 
  deLocation, 
  dxLocation, 
  onDXChange, 
  potaSpots, 
  mySpots, 
  dxPaths, 
  dxFilters, 
  satellites, 
  showDXPaths, 
  showDXLabels, 
  onToggleDXLabels, 
  showPOTA, 
  showSatellites, 
  onToggleSatellites, 
  hoveredSpot 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const terminatorRef = useRef(null);
  const deMarkerRef = useRef(null);
  const dxMarkerRef = useRef(null);
  const sunMarkerRef = useRef(null);
  const moonMarkerRef = useRef(null);
  const potaMarkersRef = useRef([]);
  const mySpotsMarkersRef = useRef([]);
  const mySpotsLinesRef = useRef([]);
  const dxPathsLinesRef = useRef([]);
  const dxPathsMarkersRef = useRef([]);
  const satMarkersRef = useRef([]);
  const satTracksRef = useRef([]);
  
  // Load map style from localStorage
  const getStoredMapSettings = () => {
    try {
      const stored = localStorage.getItem('openhamclock_mapSettings');
      return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
  };
  const storedSettings = getStoredMapSettings();
  
  const [mapStyle, setMapStyle] = useState(storedSettings.mapStyle || 'dark');
  const [mapView, setMapView] = useState({
    center: storedSettings.center || [20, 0],
    zoom: storedSettings.zoom || 2.5
  });
  
  // Save map settings to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_mapSettings', JSON.stringify({
        mapStyle,
        center: mapView.center,
        zoom: mapView.zoom
      }));
    } catch (e) { console.error('Failed to save map settings:', e); }
  }, [mapStyle, mapView]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Make sure Leaflet is available
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    const map = L.map(mapRef.current, {
      center: mapView.center,
      zoom: mapView.zoom,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true,
      maxBounds: [[-90, -Infinity], [90, Infinity]],
      maxBoundsViscosity: 0.8
    });

    // Initial tile layer
    tileLayerRef.current = L.tileLayer(MAP_STYLES[mapStyle].url, {
      attribution: MAP_STYLES[mapStyle].attribution,
      noWrap: false,
      crossOrigin: 'anonymous',
      bounds: [[-85, -180], [85, 180]]
    }).addTo(map);

    // Day/night terminator
    terminatorRef.current = L.terminator({
      resolution: 2,
      fillOpacity: 0.35,
      fillColor: '#000020',
      color: '#ffaa00',
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map);

    // Refresh terminator
    setTimeout(() => {
      if (terminatorRef.current) {
        terminatorRef.current.setTime();
      }
    }, 100);

    // Update terminator every minute
    const terminatorInterval = setInterval(() => {
      if (terminatorRef.current) {
        terminatorRef.current.setTime();
      }
    }, 60000);

    // Click handler for setting DX
    map.on('click', (e) => {
      if (onDXChange) {
        onDXChange({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    });
    
    // Save map view when user pans or zooms
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapView({ center: [center.lat, center.lng], zoom });
    });

    mapInstanceRef.current = map;

    return () => {
      clearInterval(terminatorInterval);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(MAP_STYLES[mapStyle].url, {
      attribution: MAP_STYLES[mapStyle].attribution,
      noWrap: false,
      crossOrigin: 'anonymous',
      bounds: [[-85, -180], [85, 180]]
    }).addTo(mapInstanceRef.current);
    
    // Ensure terminator is on top
    if (terminatorRef.current) {
      terminatorRef.current.bringToFront();
    }
  }, [mapStyle]);

  // Update DE/DX markers and celestial bodies
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old markers
    if (deMarkerRef.current) map.removeLayer(deMarkerRef.current);
    if (dxMarkerRef.current) map.removeLayer(dxMarkerRef.current);
    if (sunMarkerRef.current) map.removeLayer(sunMarkerRef.current);
    if (moonMarkerRef.current) map.removeLayer(moonMarkerRef.current);

    // DE Marker
    const deIcon = L.divIcon({
      className: 'custom-marker de-marker',
      html: 'DE',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    deMarkerRef.current = L.marker([deLocation.lat, deLocation.lon], { icon: deIcon })
      .bindPopup(`<b>DE - Your Location</b><br>${calculateGridSquare(deLocation.lat, deLocation.lon)}<br>${deLocation.lat.toFixed(4)}°, ${deLocation.lon.toFixed(4)}°`)
      .addTo(map);

    // DX Marker
    const dxIcon = L.divIcon({
      className: 'custom-marker dx-marker',
      html: 'DX',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    dxMarkerRef.current = L.marker([dxLocation.lat, dxLocation.lon], { icon: dxIcon })
      .bindPopup(`<b>DX - Target</b><br>${calculateGridSquare(dxLocation.lat, dxLocation.lon)}<br>${dxLocation.lat.toFixed(4)}°, ${dxLocation.lon.toFixed(4)}°`)
      .addTo(map);

    // Sun marker
    const sunPos = getSunPosition(new Date());
    const sunIcon = L.divIcon({
      className: 'custom-marker sun-marker',
      html: '☀',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    sunMarkerRef.current = L.marker([sunPos.lat, sunPos.lon], { icon: sunIcon })
      .bindPopup(`<b>☀ Subsolar Point</b><br>${sunPos.lat.toFixed(2)}°, ${sunPos.lon.toFixed(2)}°`)
      .addTo(map);

    // Moon marker
    const moonPos = getMoonPosition(new Date());
    const moonIcon = L.divIcon({
      className: 'custom-marker moon-marker',
      html: '🌙',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    moonMarkerRef.current = L.marker([moonPos.lat, moonPos.lon], { icon: moonIcon })
      .bindPopup(`<b>🌙 Sublunar Point</b><br>${moonPos.lat.toFixed(2)}°, ${moonPos.lon.toFixed(2)}°`)
      .addTo(map);
  }, [deLocation, dxLocation]);

  // Update DX paths
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old DX paths
    dxPathsLinesRef.current.forEach(l => map.removeLayer(l));
    dxPathsLinesRef.current = [];
    dxPathsMarkersRef.current.forEach(m => map.removeLayer(m));
    dxPathsMarkersRef.current = [];

    // Add new DX paths if enabled
    if (showDXPaths && dxPaths && dxPaths.length > 0) {
      const filteredPaths = filterDXPaths(dxPaths, dxFilters);
      
      filteredPaths.forEach((path) => {
        try {
          if (!path.spotterLat || !path.spotterLon || !path.dxLat || !path.dxLon) return;
          if (isNaN(path.spotterLat) || isNaN(path.spotterLon) || isNaN(path.dxLat) || isNaN(path.dxLon)) return;
          
          const pathPoints = getGreatCirclePoints(
            path.spotterLat, path.spotterLon,
            path.dxLat, path.dxLon
          );
          
          if (!pathPoints || !Array.isArray(pathPoints) || pathPoints.length === 0) return;
          
          const freq = parseFloat(path.freq);
          const color = getBandColor(freq);
          
          const isHovered = hoveredSpot && hoveredSpot.call === path.dxCall && 
                           Math.abs(parseFloat(hoveredSpot.freq) - parseFloat(path.freq)) < 0.01;
          
          // Handle segments
          const isSegmented = Array.isArray(pathPoints[0]) && pathPoints[0].length > 0 && Array.isArray(pathPoints[0][0]);
          const segments = isSegmented ? pathPoints : [pathPoints];
          
          segments.forEach(segment => {
            if (segment && Array.isArray(segment) && segment.length > 1) {
              const line = L.polyline(segment, {
                color: isHovered ? '#ffffff' : color,
                weight: isHovered ? 4 : 1.5,
                opacity: isHovered ? 1 : 0.5
              }).addTo(map);
              if (isHovered) line.bringToFront();
              dxPathsLinesRef.current.push(line);
            }
          });

          // Add DX marker
          const dxCircle = L.circleMarker([path.dxLat, path.dxLon], {
            radius: isHovered ? 10 : 6,
            fillColor: isHovered ? '#ffffff' : color,
            color: isHovered ? color : '#fff',
            weight: isHovered ? 3 : 1.5,
            opacity: 1,
            fillOpacity: isHovered ? 1 : 0.9
          })
            .bindPopup(`<b style="color: ${color}">${path.dxCall}</b><br>${path.freq} MHz<br>by ${path.spotter}`)
            .addTo(map);
          if (isHovered) dxCircle.bringToFront();
          dxPathsMarkersRef.current.push(dxCircle);
          
          // Add label if enabled
          if (showDXLabels || isHovered) {
            const labelIcon = L.divIcon({
              className: '',
              html: `<div style="background: ${isHovered ? '#fff' : color}; color: ${isHovered ? color : '#000'}; padding: 2px 6px; border-radius: 3px; font-family: JetBrains Mono; font-size: 11px; font-weight: 600; white-space: nowrap;">${path.dxCall}</div>`,
              iconAnchor: [0, -10]
            });
            const label = L.marker([path.dxLat, path.dxLon], { icon: labelIcon, interactive: false }).addTo(map);
            dxPathsMarkersRef.current.push(label);
          }
        } catch (err) {
          console.error('Error rendering DX path:', err);
        }
      });
    }
  }, [dxPaths, dxFilters, showDXPaths, showDXLabels, hoveredSpot]);

  // Update POTA markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    potaMarkersRef.current.forEach(m => map.removeLayer(m));
    potaMarkersRef.current = [];

    if (showPOTA && potaSpots) {
      potaSpots.forEach(spot => {
        if (spot.lat && spot.lon) {
          const icon = L.divIcon({
            className: '',
            html: `<div style="background: #aa66ff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: JetBrains Mono; white-space: nowrap; border: 1px solid white;">${spot.call}</div>`,
            iconAnchor: [20, 10]
          });
          const marker = L.marker([spot.lat, spot.lon], { icon })
            .bindPopup(`<b>${spot.call}</b><br>${spot.ref}<br>${spot.freq} ${spot.mode}`)
            .addTo(map);
          potaMarkersRef.current.push(marker);
        }
      });
    }
  }, [potaSpots, showPOTA]);

  // Update satellite markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    satMarkersRef.current.forEach(m => map.removeLayer(m));
    satMarkersRef.current = [];
    satTracksRef.current.forEach(t => map.removeLayer(t));
    satTracksRef.current = [];

    if (showSatellites && satellites && satellites.length > 0) {
      satellites.forEach(sat => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="background: #00ffff; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: JetBrains Mono; white-space: nowrap; border: 2px solid ${sat.visible ? '#fff' : 'rgba(255,255,255,0.3)'}; font-weight: bold; opacity: ${sat.visible ? 1 : 0.6};">🛰 ${sat.name}</div>`,
          iconAnchor: [25, 12]
        });
        
        const marker = L.marker([sat.lat, sat.lon], { icon })
          .bindPopup(`<b>🛰 ${sat.name}</b><br>Alt: ${sat.alt} km<br>Az: ${sat.azimuth}° El: ${sat.elevation}°`)
          .addTo(map);
        satMarkersRef.current.push(marker);
      });
    }
  }, [satellites, showSatellites]);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
      
      {/* Map style dropdown */}
      <select
        value={mapStyle}
        onChange={(e) => setMapStyle(e.target.value)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #444',
          color: '#00ffcc',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono',
          cursor: 'pointer',
          zIndex: 1000,
          outline: 'none'
        }}
      >
        {Object.entries(MAP_STYLES).map(([key, style]) => (
          <option key={key} value={key}>{style.name}</option>
        ))}
      </select>
      
      {/* Satellite toggle */}
      {onToggleSatellites && (
        <button
          onClick={onToggleSatellites}
          style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            background: showSatellites ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.8)',
            border: `1px solid ${showSatellites ? '#00ffff' : '#666'}`,
            color: showSatellites ? '#00ffff' : '#888',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          🛰 SAT {showSatellites ? 'ON' : 'OFF'}
        </button>
      )}
      
      {/* Labels toggle */}
      {onToggleDXLabels && showDXPaths && (
        <button
          onClick={onToggleDXLabels}
          style={{
            position: 'absolute',
            top: '10px',
            left: '145px',
            background: showDXLabels ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 0, 0, 0.8)',
            border: `1px solid ${showDXLabels ? '#ffaa00' : '#666'}`,
            color: showDXLabels ? '#ffaa00' : '#888',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          🏷️ CALLS {showDXLabels ? 'ON' : 'OFF'}
        </button>
      )}
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid #444',
        borderRadius: '6px',
        padding: '6px 12px',
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        fontSize: '10px',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        {showDXPaths && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: '#888' }}>DX:</span>
            <span style={{ color: '#ff6666' }}>160m</span>
            <span style={{ color: '#ffcc66' }}>40m</span>
            <span style={{ color: '#66ff99' }}>20m</span>
            <span style={{ color: '#66ccff' }}>15m</span>
            <span style={{ color: '#9966ff' }}>10m</span>
          </div>
        )}
        {showPOTA && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ color: '#aa66ff' }}>● POTA</span>
          </div>
        )}
        {showSatellites && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ color: '#00ffff' }}>🛰 SAT</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
