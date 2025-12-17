import { useEffect, useState, useRef } from "react";

export function useRealtimeWS(enabled = false) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    avgLatency: 0,
    errorRate: 0,
    totalRequests: 0
  });

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connectWS = () => {
    const WS_URL = `ws://${window.location.hostname}:4000`;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    // Expose globally for debugging
    window.__ws_debug = ws;

    ws.onopen = () => {
      console.log("Connected to REAL WebSocket server");
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (msg) => {
      const { type, data } = JSON.parse(msg.data);

      if (type === "metrics" && Array.isArray(data)) {
        setEvents((prev) => [...data, ...prev].slice(0, 200));

        const lat = data.map(m => m.duration || 0);
        const avgLatency = lat.length ? lat.reduce((a, b) => a + b) / lat.length : 0;

        const errs = data.filter(m => !m.success).length;

        setSummary(prev => ({
          avgLatency,
          errorRate: ((prev.totalRequests * prev.errorRate/100 + errs) / (prev.totalRequests + data.length)) * 100,
          totalRequests: prev.totalRequests + data.length
        }));
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onclose = () => {
      console.log("WebSocket closed – reconnecting in 1.5s...");
      reconnectTimer.current = setTimeout(connectWS, 1500);
    };
  };

  useEffect(() => {
    if (!enabled) return;

    connectWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [enabled]);

  return { events, summary };
}
