import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// ADD THIS ↓↓↓
import PerfWatch from '../sdk/perfwatch.js';

if (!window.PerfWatchInstance) {
  window.PerfWatchInstance = new PerfWatch({
    enabled: true,
    batchSize: 10,
    flushInterval: 2000,
    endpoint: 'http://localhost:4000/api/metrics',
    wsUrl: 'ws://localhost:4000'
  });
  console.log('%cPerfWatch SDK Initialized', 'color: #10b981; font-weight: bold;');
}
// ADD THIS ↑↑↑

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
