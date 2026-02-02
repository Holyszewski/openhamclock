/**
 * useBandConditions Hook
 * Calculates HF band conditions based on SFI, K-index, and time of day
 */
import { useState, useEffect } from 'react';

export const useBandConditions = (spaceWeather) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceWeather?.solarFlux) {
      setLoading(true);
      return;
    }

    const sfi = parseInt(spaceWeather.solarFlux) || 100;
    const kIndex = parseInt(spaceWeather.kIndex) || 3;
    const hour = new Date().getUTCHours();
    
    // Determine if it's day or night (simplified - assumes mid-latitudes)
    const isDaytime = hour >= 6 && hour <= 18;
    const isGrayline = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19);
    
    // Calculate band conditions based on SFI, K-index, and time
    const calculateCondition = (band) => {
      let score = 50; // Base score
      
      // SFI impact (higher SFI = better high bands, less impact on low bands)
      const sfiImpact = {
        '160m': (sfi - 100) * 0.05,
        '80m': (sfi - 100) * 0.1,
        '60m': (sfi - 100) * 0.15,
        '40m': (sfi - 100) * 0.2,
        '30m': (sfi - 100) * 0.25,
        '20m': (sfi - 100) * 0.35,
        '17m': (sfi - 100) * 0.4,
        '15m': (sfi - 100) * 0.45,
        '12m': (sfi - 100) * 0.5,
        '11m': (sfi - 100) * 0.52,  // CB band - similar to 12m/10m
        '10m': (sfi - 100) * 0.55,
        '6m': (sfi - 100) * 0.6,
        '2m': 0, // VHF not affected by HF propagation
        '70cm': 0
      };
      score += sfiImpact[band] || 0;
      
      // K-index impact (geomagnetic storms hurt propagation)
      // K=0-1: bonus, K=2-3: neutral, K=4+: penalty
      if (kIndex <= 1) score += 15;
      else if (kIndex <= 2) score += 5;
      else if (kIndex >= 5) score -= 40;
      else if (kIndex >= 4) score -= 25;
      else if (kIndex >= 3) score -= 10;
      
      // Time of day impact
      const timeImpact = {
        '160m': isDaytime ? -30 : 25, // Night band
        '80m': isDaytime ? -20 : 20,  // Night band
        '60m': isDaytime ? -10 : 15,
        '40m': isGrayline ? 20 : (isDaytime ? 5 : 15), // Good day & night
        '30m': isDaytime ? 15 : 10,
        '20m': isDaytime ? 25 : -15, // Day band
        '17m': isDaytime ? 25 : -20,
        '15m': isDaytime ? 20 : -25, // Day band
        '12m': isDaytime ? 15 : -30,
        '11m': isDaytime ? 15 : -32, // CB band - day band, needs high SFI
        '10m': isDaytime ? 15 : -35, // Day band, needs high SFI
        '6m': isDaytime ? 10 : -40,  // Sporadic E, mostly daytime
        '2m': 10, // Local/tropo - always available
        '70cm': 10
      };
      score += timeImpact[band] || 0;
      
      // High bands need minimum SFI to open
      if (['10m', '11m', '12m', '6m'].includes(band) && sfi < 100) score -= 30;
      if (['15m', '17m'].includes(band) && sfi < 80) score -= 15;
      
      // Convert score to condition
      if (score >= 65) return 'GOOD';
      if (score >= 40) return 'FAIR';
      return 'POOR';
    };
    
    const bands = ['160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '11m', '10m', '6m', '2m'];
    const conditions = bands.map(band => ({
      band,
      condition: calculateCondition(band)
    }));
    
    setData(conditions);
    setLoading(false);
  }, [spaceWeather?.solarFlux, spaceWeather?.kIndex]);

  return { data, loading };
};

export default useBandConditions;
