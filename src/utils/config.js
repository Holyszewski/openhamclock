/**
 * Configuration Utilities
 * Handles app configuration, localStorage persistence, and theme management
 * 
 * Configuration priority:
 * 1. localStorage (user's browser settings)
 * 2. Server config (from .env file)
 * 3. Default values
 */

export const DEFAULT_CONFIG = {
  callsign: 'N0CALL',
  locator: '',
  location: { lat: 40.0150, lon: -105.2705 }, // Boulder, CO (default)
  defaultDX: { lat: 35.6762, lon: 139.6503 }, // Tokyo
  units: 'imperial', // 'imperial' or 'metric'
  theme: 'dark', // 'dark', 'light', 'legacy', or 'retro'
  layout: 'modern', // 'modern' or 'classic'
  use12Hour: true,
  showSatellites: true,
  showPota: true,
  showDxPaths: true,
  refreshIntervals: {
    spaceWeather: 300000,
    bandConditions: 300000,
    pota: 60000,
    dxCluster: 30000,
    terminator: 60000
  }
};

// Cache for server config
let serverConfig = null;

/**
 * Fetch configuration from server (.env file)
 * This is called once on app startup
 */
export const fetchServerConfig = async () => {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      serverConfig = await response.json();
      console.log('[Config] Loaded from server:', serverConfig.callsign, '@', serverConfig.locator);
      return serverConfig;
    }
  } catch (e) {
    console.warn('[Config] Could not fetch server config, using defaults');
  }
  return null;
};

/**
 * Load config from localStorage, merged with server config
 */
export const loadConfig = () => {
  let config = { ...DEFAULT_CONFIG };
  
  // First, apply server config if available
  if (serverConfig) {
    config = {
      ...config,
      callsign: serverConfig.callsign || config.callsign,
      locator: serverConfig.locator || config.locator,
      location: {
        lat: serverConfig.latitude || config.location.lat,
        lon: serverConfig.longitude || config.location.lon
      },
      defaultDX: {
        lat: serverConfig.dxLatitude || config.defaultDX.lat,
        lon: serverConfig.dxLongitude || config.defaultDX.lon
      },
      units: serverConfig.units || config.units,
      theme: serverConfig.theme || config.theme,
      layout: serverConfig.layout || config.layout,
      use12Hour: serverConfig.timeFormat === '12',
      showSatellites: serverConfig.showSatellites ?? config.showSatellites,
      showPota: serverConfig.showPota ?? config.showPota,
      showDxPaths: serverConfig.showDxPaths ?? config.showDxPaths,
      configIncomplete: serverConfig.configIncomplete
    };
  }
  
  // Then, override with localStorage (user's local changes)
  try {
    const saved = localStorage.getItem('openhamclock_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      config = { ...config, ...parsed };
    }
  } catch (e) {
    console.error('Error loading config from localStorage:', e);
  }
  
  return config;
};

/**
 * Save config to localStorage
 */
export const saveConfig = (config) => {
  try {
    localStorage.setItem('openhamclock_config', JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config:', e);
  }
};

/**
 * Check if configuration is incomplete (show setup wizard)
 */
export const isConfigIncomplete = () => {
  const config = loadConfig();
  return config.callsign === 'N0CALL' || !config.locator;
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

/**
 * Map Tile Providers
 */
export const MAP_STYLES = {
  dark: {
    name: 'Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  streets: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  topo: {
    name: 'Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  watercolor: {
    name: 'Ocean',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  hybrid: {
    name: 'Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google'
  },
  gray: {
    name: 'Gray',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

export default {
  DEFAULT_CONFIG,
  fetchServerConfig,
  loadConfig,
  saveConfig,
  isConfigIncomplete,
  applyTheme,
  MAP_STYLES
};
