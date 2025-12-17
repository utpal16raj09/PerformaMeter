import { useState, useEffect, useRef } from 'react';

export function useRealtimeMetrics(fetchFn, interval = 5000, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const timerRef = useRef(null);

  const fetchData = async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    if (interval > 0) {
      timerRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, ...dependencies]);

  return { data, loading, lastUpdated, refresh: fetchData };
}