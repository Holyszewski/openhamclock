/**
 * useLocalWeather Hook
 * Fetches weather data from Open-Meteo API
 */
import { useState, useEffect } from 'react';

// Weather code to description and icon mapping
const WEATHER_CODES = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Fog', icon: '🌫️' },
  48: { desc: 'Depositing rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌧️' },
  53: { desc: 'Moderate drizzle', icon: '🌧️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  61: { desc: 'Slight rain', icon: '🌧️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '🌨️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  77: { desc: 'Snow grains', icon: '🌨️' },
  80: { desc: 'Slight rain showers', icon: '🌦️' },
  81: { desc: 'Moderate rain showers', icon: '🌦️' },
  82: { desc: 'Violent rain showers', icon: '⛈️' },
  85: { desc: 'Slight snow showers', icon: '🌨️' },
  86: { desc: 'Heavy snow showers', icon: '❄️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

export const useLocalWeather = (location) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          const code = result.current?.weather_code;
          const weather = WEATHER_CODES[code] || { desc: 'Unknown', icon: '🌡️' };
          
          setData({
            temp: Math.round(result.current?.temperature_2m || 0),
            description: weather.desc,
            icon: weather.icon,
            windSpeed: Math.round(result.current?.wind_speed_10m || 0),
            weatherCode: code
          });
        }
      } catch (err) {
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(interval);
  }, [location?.lat, location?.lon]);

  return { data, loading };
};

export default useLocalWeather;
