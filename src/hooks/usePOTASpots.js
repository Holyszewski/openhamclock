/**
 * usePOTASpots Hook
 * Fetches Parks on the Air activations
 */
import { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from '../utils/config.js';

export const usePOTASpots = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPOTA = async () => {
      try {
        const res = await fetch('https://api.pota.app/spot/activator');
        if (res.ok) {
          const spots = await res.json();
          setData(spots.slice(0, 10).map(s => ({
            call: s.activator, 
            ref: s.reference, 
            freq: s.frequency, 
            mode: s.mode,
            name: s.name || s.locationDesc, 
            lat: s.latitude, 
            lon: s.longitude,
            time: s.spotTime ? new Date(s.spotTime).toISOString().substr(11,5)+'z' : ''
          })));
        }
      } catch (err) { 
        console.error('POTA error:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchPOTA();
    const interval = setInterval(fetchPOTA, DEFAULT_CONFIG.refreshIntervals.pota);
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
};

export default usePOTASpots;
