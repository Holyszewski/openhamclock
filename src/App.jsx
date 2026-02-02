/**
 * OpenHamClock - Main Application Component
 * Amateur Radio Dashboard v3.7.0
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Components
import {
  Header,
  WorldMap,
  SpaceWeatherPanel,
  BandConditionsPanel,
  DXClusterPanel,
  POTAPanel,
  ContestPanel,
  LocationPanel,
  SettingsPanel,
  DXFilterManager
} from './components';

// Hooks
import {
  useSpaceWeather,
  useBandConditions,
  useDXCluster,
  useDXPaths,
  usePOTASpots,
  useContests,
  useLocalWeather,
  usePropagation,
  useMySpots,
  useDXpeditions,
  useSatellites,
  useSolarIndices
} from './hooks';

// Utils
import {
  loadConfig,
  saveConfig,
  applyTheme,
  calculateGridSquare,
  calculateSunTimes
} from './utils';

const App = () => {
  // Configuration state
  const [config, setConfig] = useState(loadConfig);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('0d 0h 0m');
  
  // DX Location with localStorage persistence
  const [dxLocation, setDxLocation] = useState(() => {
    try {
      const stored = localStorage.getItem('openhamclock_dxLocation');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lat && parsed.lon) return parsed;
      }
    } catch (e) {}
    return config.defaultDX;
  });
  
  // Save DX location when changed
  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_dxLocation', JSON.stringify(dxLocation));
    } catch (e) { console.error('Failed to save DX location:', e); }
  }, [dxLocation]);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showDXFilters, setShowDXFilters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Map layer visibility state with localStorage persistence
  const [mapLayers, setMapLayers] = useState(() => {
    try {
      const stored = localStorage.getItem('openhamclock_mapLayers');
      const defaults = { showDXPaths: true, showDXLabels: true, showPOTA: true, showSatellites: true };
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (e) { return { showDXPaths: true, showDXLabels: true, showPOTA: true, showSatellites: true }; }
  });
  
  // Save map layer preferences when changed
  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_mapLayers', JSON.stringify(mapLayers));
    } catch (e) { console.error('Failed to save map layers:', e); }
  }, [mapLayers]);
  
  // Hovered spot state for highlighting paths on map
  const [hoveredSpot, setHoveredSpot] = useState(null);
  
  // Toggle handlers for map layers
  const toggleDXPaths = useCallback(() => setMapLayers(prev => ({ ...prev, showDXPaths: !prev.showDXPaths })), []);
  const toggleDXLabels = useCallback(() => setMapLayers(prev => ({ ...prev, showDXLabels: !prev.showDXLabels })), []);
  const togglePOTA = useCallback(() => setMapLayers(prev => ({ ...prev, showPOTA: !prev.showPOTA })), []);
  const toggleSatellites = useCallback(() => setMapLayers(prev => ({ ...prev, showSatellites: !prev.showSatellites })), []);
  
  // 12/24 hour format preference with localStorage persistence
  const [use12Hour, setUse12Hour] = useState(() => {
    try {
      const saved = localStorage.getItem('openhamclock_use12Hour');
      return saved === 'true';
    } catch (e) { return false; }
  });
  
  // Save 12/24 hour preference when changed
  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_use12Hour', use12Hour.toString());
    } catch (e) { console.error('Failed to save time format:', e); }
  }, [use12Hour]);
  
  // Toggle time format handler
  const handleTimeFormatToggle = useCallback(() => {
    setUse12Hour(prev => !prev);
  }, []);

  // Fullscreen toggle handler
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Exit fullscreen error:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Apply theme on initial load
  useEffect(() => {
    applyTheme(config.theme || 'dark');
  }, []);

  // Check if this is first run
  useEffect(() => {
    const saved = localStorage.getItem('openhamclock_config');
    if (!saved) {
      setShowSettings(true);
    }
  }, []);

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    applyTheme(newConfig.theme || 'dark');
  };

  // Data hooks
  const spaceWeather = useSpaceWeather();
  const bandConditions = useBandConditions(spaceWeather.data);
  const solarIndices = useSolarIndices();
  const potaSpots = usePOTASpots();
  
  // DX Cluster filters with localStorage persistence
  const [dxFilters, setDxFilters] = useState(() => {
    try {
      const stored = localStorage.getItem('openhamclock_dxFilters');
      return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
  });
  
  // Save DX filters when changed
  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_dxFilters', JSON.stringify(dxFilters));
    } catch (e) {}
  }, [dxFilters]);
  
  const dxCluster = useDXCluster(config.dxClusterSource || 'auto', dxFilters);
  const dxPaths = useDXPaths();
  const dxpeditions = useDXpeditions();
  const contests = useContests();
  const propagation = usePropagation(config.location, dxLocation);
  const mySpots = useMySpots(config.callsign);
  const satellites = useSatellites(config.location);
  const localWeather = useLocalWeather(config.location);

  // Computed values
  const deGrid = useMemo(() => calculateGridSquare(config.location.lat, config.location.lon), [config.location]);
  const dxGrid = useMemo(() => calculateGridSquare(dxLocation.lat, dxLocation.lon), [dxLocation]);
  const deSunTimes = useMemo(() => calculateSunTimes(config.location.lat, config.location.lon, currentTime), [config.location, currentTime]);
  const dxSunTimes = useMemo(() => calculateSunTimes(dxLocation.lat, dxLocation.lon, currentTime), [dxLocation, currentTime]);

  // Time and uptime update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      const elapsed = Date.now() - startTime;
      const d = Math.floor(elapsed / 86400000);
      const h = Math.floor((elapsed % 86400000) / 3600000);
      const m = Math.floor((elapsed % 3600000) / 60000);
      setUptime(`${d}d ${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleDXChange = useCallback((coords) => {
    setDxLocation({ lat: coords.lat, lon: coords.lon });
  }, []);

  // Format times
  const utcTime = currentTime.toISOString().substr(11, 8);
  const localTime = currentTime.toLocaleTimeString('en-US', { hour12: use12Hour });
  const utcDate = currentTime.toISOString().substr(0, 10);
  const localDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Scale factor for modern layout
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const calculateScale = () => {
      const minWidth = 1200;
      const minHeight = 800;
      const scaleX = window.innerWidth / minWidth;
      const scaleY = window.innerHeight / minHeight;
      setScale(Math.min(scaleX, scaleY, 1));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Modern Layout
  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <div style={{ 
        width: scale < 1 ? `${100 / scale}vw` : '100vw',
        height: scale < 1 ? `${100 / scale}vh` : '100vh',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 280px',
        gridTemplateRows: '50px 1fr',
        gap: '8px',
        padding: '8px',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* TOP BAR */}
        <Header
          config={config}
          utcTime={utcTime}
          utcDate={utcDate}
          localTime={localTime}
          localDate={localDate}
          localWeather={localWeather}
          spaceWeather={spaceWeather}
          use12Hour={use12Hour}
          onTimeFormatToggle={handleTimeFormatToggle}
          onSettingsClick={() => setShowSettings(true)}
          onFullscreenToggle={handleFullscreenToggle}
          isFullscreen={isFullscreen}
        />
        
        {/* LEFT COLUMN */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          overflow: 'hidden'
        }}>
          <LocationPanel
            config={config}
            dxLocation={dxLocation}
            deSunTimes={deSunTimes}
            dxSunTimes={dxSunTimes}
            currentTime={currentTime}
          />
          <SpaceWeatherPanel data={spaceWeather.data} loading={spaceWeather.loading} />
          <BandConditionsPanel data={bandConditions.data} loading={bandConditions.loading} />
        </div>
        
        {/* CENTER - MAP */}
        <div style={{ 
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <WorldMap
            deLocation={config.location}
            dxLocation={dxLocation}
            onDXChange={handleDXChange}
            potaSpots={potaSpots.data}
            mySpots={mySpots.data}
            dxPaths={dxPaths.data}
            dxFilters={dxFilters}
            satellites={satellites.data}
            showDXPaths={mapLayers.showDXPaths}
            showDXLabels={mapLayers.showDXLabels}
            onToggleDXLabels={toggleDXLabels}
            showPOTA={mapLayers.showPOTA}
            showSatellites={mapLayers.showSatellites}
            onToggleSatellites={toggleSatellites}
            hoveredSpot={hoveredSpot}
          />
        </div>
        
        {/* RIGHT COLUMN */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          overflow: 'hidden'
        }}>
          <DXClusterPanel
            data={dxCluster.data}
            loading={dxCluster.loading}
            totalSpots={dxCluster.totalSpots}
            filters={dxFilters}
            onOpenFilters={() => setShowDXFilters(true)}
            onHoverSpot={setHoveredSpot}
            hoveredSpot={hoveredSpot}
          />
          <POTAPanel data={potaSpots.data} loading={potaSpots.loading} />
          <ContestPanel data={contests.data} loading={contests.loading} />
        </div>
      </div>
      
      {/* Modals */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        config={config}
        onSave={handleSaveConfig}
      />
      <DXFilterManager
        filters={dxFilters}
        onFilterChange={setDxFilters}
        isOpen={showDXFilters}
        onClose={() => setShowDXFilters(false)}
      />
    </div>
  );
};

export default App;
