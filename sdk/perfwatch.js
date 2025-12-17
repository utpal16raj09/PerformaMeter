/**
 * PerfWatch SDK - Client-side Performance Monitoring
 * Auto-collects metrics: latency, memory, CPU, errors
 * Features: batching, auto-flush, optional WebSocket broadcasting
 */

class PerfWatch {
  constructor(config = {}) {
    this.config = {
      batchSize: config.batchSize || 50,
      flushInterval: config.flushInterval || 5000,
      endpoint: config.endpoint || '/api/metrics', // HTTP ingestion endpoint
      wsUrl: null,                  // WebSocket URL (optional)
      enabled: config.enabled !== false,
      maxLocalStorage: config.maxLocalStorage || 1000,
      reconnectInterval: config.reconnectInterval || 2000,
      ...config
    };

    this.metrics = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.flushTimer = null;
    this.errorCount = 0;
    this.requestCount = 0;

    // WebSocket related
    this.ws = null;
    this._wsReconnectTimer = null;
    this._manuallyClosed = false;

    if (this.config.enabled && typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.startAutoFlush();
    this.setupErrorTracking();
    this.setupPerformanceObserver();
    this.trackPageLoad();
    this.trackResourceTiming();
    //this._connectWSIfConfigured();
  }

  // ----------------------
  // Utilities
  // ----------------------
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _safeLocalStorageGet(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  _safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore quota errors
    }
  }

  // ----------------------
  // WebSocket logic
  // ----------------------
  _connectWSIfConfigured() {
    // If wsUrl is explicitly falsey, don't attempt
    if (!this.config.wsUrl && !this.config.wsAuto) {
      return;
    }

    // Choose wsUrl: explicit or sensible default (localhost fallback)
    const wsUrl = this.config.wsUrl || (typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port || 4000}`
      : 'ws://localhost:4000');

    this._connectWS(wsUrl);
    // expose for debugging
    if (typeof window !== 'undefined') {
      window.PerfWatchSocketUrl = wsUrl;
    }
  }

  _connectWS(wsUrl) {
    // avoid multiple parallel connections
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    try {
      this._manuallyClosed = false;
      this.ws = new WebSocket(wsUrl);

      this.ws.addEventListener('open', () => {
        // expose socket globally so app can inspect if needed
        if (typeof window !== 'undefined') window.PerfWatchSocket = this.ws;
        // on connect, send a hello with session id
        try { this.ws.send(JSON.stringify({ event: 'hello', payload: { sessionId: this.sessionId, ts: Date.now() } })); } catch (e) {}
      });

      this.ws.addEventListener('message', (ev) => {
        // future: support commands from server
        try {
          const parsed = JSON.parse(ev.data);
          // handle server commands if needed
          if (parsed && parsed.command === 'ping') {
            this.ws.send(JSON.stringify({ event: 'pong', payload: { ts: Date.now() } }));
          }
        } catch (e) {}
      });

      this.ws.addEventListener('close', () => {
        if (!this._manuallyClosed) {
          // schedule reconnect
          this._wsReconnectTimer = setTimeout(() => {
            this._connectWS(wsUrl);
          }, this.config.reconnectInterval);
        }
      });

      this.ws.addEventListener('error', () => {
        // try to close and reconnect - errors are not actionable client-side
        try { this.ws.close(); } catch (e) {}
      });

    } catch (e) {
      // swallow
      this.ws = null;
    }
  }

  _broadcastBatchOverWS(batch) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify({ event: 'metrics_batch', payload: batch }));
    } catch (e) {
      // ignore send errors
    }
  }

  // allow manual close of ws to avoid reconnects
  closeWS() {
    this._manuallyClosed = true;
    if (this._wsReconnectTimer) {
      clearTimeout(this._wsReconnectTimer);
      this._wsReconnectTimer = null;
    }
    try { if (this.ws) this.ws.close(); } catch (e) {}
    this.ws = null;
    if (typeof window !== 'undefined') window.PerfWatchSocket = null;
  }

  // ----------------------
  // SDK feature: error tracking
  // ----------------------
  setupErrorTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandledRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });
  }

  // ----------------------
  // Performance observer
  // ----------------------
  setupPerformanceObserver() {
    if (typeof window === 'undefined') return;
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.trackMetric({
                type: 'navigation',
                name: 'page_load',
                duration: entry.duration,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                loadComplete: entry.loadEventEnd - entry.loadEventStart,
                timestamp: Date.now()
              });
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        // ignore
      }
    }
  }

  trackPageLoad() {
    if (typeof window === 'undefined') return;
    if (document.readyState === 'complete') {
      this.recordPageLoadMetrics();
    } else {
      window.addEventListener('load', () => this.recordPageLoadMetrics());
    }
  }

  recordPageLoadMetrics() {
    if (typeof window === 'undefined') return;
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      this.trackMetric({
        type: 'pageLoad',
        name: 'initial_load',
        duration: Math.max(0, loadTime),
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        timestamp: Date.now()
      });
    }
  }

  trackResourceTiming() {
    if (typeof window === 'undefined') return;
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      resources.forEach(resource => {
        if (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') {
          this.trackMetric({
            type: 'resource',
            name: resource.name,
            duration: Math.max(0, resource.duration || 0),
            size: resource.transferSize || 0,
            timestamp: Date.now()
          });
        }
      });
    }
  }

  // ----------------------
  // API request tracker
  // ----------------------
  trackRequest(endpoint, options = {}) {
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.requestCount++;

    return {
      requestId,
      end: (status, error = null) => {
        const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const duration = Math.max(0, endTime - startTime);
        const metric = {
          type: 'api_request',
          requestId,
          endpoint,
          method: options.method || 'GET',
          status,
          duration,
          success: !error && status >= 200 && status < 400,
          error: error ? String(error) : null,
          timestamp: Date.now(),
          memoryUsage: this._getMemoryPercentage(),
          cpu: this.getCPUUsage()
        };

        this.trackMetric(metric);

        if (error || (typeof status === 'number' && status >= 400)) {
          this.errorCount++;
        }

        return metric;
      }
    };
  }

  // ----------------------
  // Core metric handling
  // ----------------------
  trackMetric(metric) {
    const enrichedMetric = {
      ...metric,
      sessionId: this.sessionId,
      timestamp: metric.timestamp || Date.now(),
      userAgent: (typeof navigator !== 'undefined') ? navigator.userAgent : 'server',
      url: (typeof window !== 'undefined') ? window.location.href : '',
      viewport: (typeof window !== 'undefined') ? { width: window.innerWidth, height: window.innerHeight } : null
    };

    this.metrics.push(enrichedMetric);

    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackError(error) {
    this.errorCount++;
    this.trackMetric({
      type: 'error',
      ...error,
      severity: 'error',
      timestamp: Date.now()
    });
  }

  // Better memory percentage helper (returns numeric percent)
  _getMemoryPercentage() {
    try {
      if (typeof performance !== 'undefined' && performance.memory && performance.memory.usedJSHeapSize && performance.memory.jsHeapSizeLimit) {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        return Math.min(100, (used / limit) * 100);
      }
    } catch (e) {}
    return null;
  }

  getMemoryUsage() {
    const pct = this._getMemoryPercentage();
    if (pct === null) return null;
    return {
      percentage: Number(pct.toFixed(2))
    };
  }

  getCPUUsage() {
    if (typeof performance !== 'undefined' && performance.now) {
      const now = performance.now();
      const elapsed = now - (this.startTime || Date.now());
      return {
        elapsed,
        approximation: 'client-side estimation'
      };
    }
    return null;
  }

  // ----------------------
  // Auto flush and flush logic
  // ----------------------
  startAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.metrics.length > 0) {
        this.flush();
      }
    }, Math.max(1000, this.config.flushInterval));
  }

  flush() {
    if (this.metrics.length === 0) return [];

    const batch = [...this.metrics];
    this.metrics = [];

    // Store in localStorage for mock / offline retrieval
    try {
      const existing = this._safeLocalStorageGet('perfwatch_metrics') || [];
      const combined = [...existing, ...batch].slice(-this.config.maxLocalStorage); // Keep last N metrics
      this._safeLocalStorageSet('perfwatch_metrics', combined);
    } catch (e) {
      console.error('Failed to store metrics:', e);
    }

    // Broadcast over WebSocket if connected
    try {
      this._broadcastBatchOverWS(batch);
    } catch (e) {
      // ignore ws broadcast failures
    }

    // POST to configured endpoint (if provided)
    if (this.config.endpoint) {
      try {
        // Always attempt POST; server should accept { metrics: [...] }
        fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: batch })
        }).catch(err => {
          // optionally re-queue or log
          console.error('PerfWatch failed to POST metrics:', err);
        });
      } catch (e) {
        // ignore
      }
    }

    return batch;
  }

  // ----------------------
  // Summary / lifecycle
  // ----------------------
  getSummary() {
    return {
      sessionId: this.sessionId,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      metricsCollected: this.metrics.length,
      uptime: Date.now() - this.startTime
    };
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.closeWS();
    this.flush();
  }
}

// Auto-register class on window (so other code can use window.PerfWatch)
if (typeof window !== 'undefined') {
  window.PerfWatch = PerfWatch;
}

export default PerfWatch;
