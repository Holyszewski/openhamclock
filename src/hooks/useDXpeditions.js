/**
 * useDXpeditions Hook
 * Fetches active and upcoming DXpeditions
 */
import { useState, useEffect } from 'react';

export const useDXpeditions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDXpeditions = async () => {
      try {
        const response = await fetch('/api/dxpeditions');
        if (response.ok) {
          const dxpeditions = await response.json();
          setData(dxpeditions);
        }
      } catch (err) {
        console.error('DXpeditions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDXpeditions();
    const interval = setInterval(fetchDXpeditions, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
};

export default useDXpeditions;
