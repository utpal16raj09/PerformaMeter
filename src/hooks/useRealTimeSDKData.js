import { useState, useEffect, useRef } from 'react';
import { getStoredMetrics } from '@/utils/sdkDataProcessor';

export function useRealtimeSDKData(interval = 500, enabled = true) {
  const [data, setData] = useState([]);
  const [latestEvent, setLatestEvent] = useState(null);
  const [metrics, setMetrics] = useState({
    activeRequests: 0,
    totalRequests: 0,
    errorRate: 0,
    avgLatency: 0,
    memoryUsage: 0
  });
  
  // Use a ref to keep track of processed data length to detect changes
  const lastLengthRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = () => {
      const allMetrics = getStoredMetrics();
      
      // Only update if data has changed or if we need to refresh derived metrics
      if (allMetrics.length !== lastLengthRef.current) {
        setData(allMetrics);
        
        if (allMetrics.length > 0) {
          const newItem = allMetrics[allMetrics.length - 1];
          setLatestEvent(newItem);
        }
        
        lastLengthRef.current = allMetrics.length;
      }

      // Always calculate derived metrics for gauges
      const apiRequests = allMetrics.filter(m => m.type === 'api_request');
      const recent = apiRequests.slice(-50); // Last 50 for quick stats
      
      if (recent.length > 0) {
        const totalLat = recent.reduce((sum, m) => sum + (m.duration || 0), 0);
        const errors = recent.filter(m => !m.success).length;
        const lastMem = recent[recent.length - 1]?.memory?.percentage || 0;

        setMetrics({
          activeRequests: 0, // SDK currently doesn't track pending, we'd need a different mechanism
          totalRequests: apiRequests.length,
          errorRate: (errors / recent.length) * 100,
          avgLatency: totalLat / recent.length,
          memoryUsage: parseFloat(lastMem)
        });
      }
    };

    // Initial fetch
    fetchData();

    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [interval, enabled]);

  return { data, latestEvent, metrics };
}