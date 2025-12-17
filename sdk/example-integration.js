/**
 * Example integration file showing how to use PerfWatch SDK
 */

import PerfWatch from './perfwatch.js';

// Initialize PerfWatch
const perfwatch = new PerfWatch({
  batchSize: 50,
  flushInterval: 5000,
  endpoint: '/api/metrics', // Replace with your actual endpoint
  enabled: true
});

// Example: Track API requests
async function fetchUserData(userId) {
  const tracker = perfwatch.trackRequest(`/api/users/${userId}`, { method: 'GET' });
  
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    
    tracker.end(response.status);
    return data;
  } catch (error) {
    tracker.end(500, error);
    throw error;
  }
}

// Example: Track custom metrics
perfwatch.trackMetric({
  type: 'custom',
  name: 'button_click',
  action: 'checkout',
  value: 1
});

// Example: Manual error tracking
try {
  // Some risky operation
  throw new Error('Something went wrong');
} catch (error) {
  perfwatch.trackError({
    type: 'manual',
    message: error.message,
    stack: error.stack,
    context: 'checkout_process'
  });
}

// Example: Get current session summary
const summary = perfwatch.getSummary();
console.log('Session Summary:', summary);

// Example: Clean up on page unload
window.addEventListener('beforeunload', () => {
  perfwatch.destroy();
});

// Export for use in other modules
export { perfwatch, fetchUserData };