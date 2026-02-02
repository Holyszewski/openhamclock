/**
 * useContests Hook
 * Fetches upcoming amateur radio contests
 */
import { useState, useEffect } from 'react';

export const useContests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests');
        if (response.ok) {
          const contests = await response.json();
          setData(contests);
        }
      } catch (err) {
        console.error('Contests error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
    const interval = setInterval(fetchContests, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
};

export default useContests;
