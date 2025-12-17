/**
 * Mock API Service for PerfWatch Dashboard
 * Supports both Mock Mode and Real SDK Mode
 */

import { 
  getStoredMetrics, 
  processSummary, 
  processTrends, 
  processHeatmap, 
  processDistribution 
} from '@/utils/sdkDataProcessor';

// Helper to generate mock data if no real data exists
function generateMockMetrics(count = 100) {
  const metrics = [];
  const endpoints = ['/api/users', '/api/products', '/api/orders', '/api/analytics', '/api/settings'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 60000;
    const isError = Math.random() < 0.05;

    metrics.push({
      type: 'api_request',
      requestId: `mock_${timestamp}_${i}`,
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      status: isError ? (Math.random() < 0.5 ? 500 : 404) : 200,
      duration: Math.random() * 2000 + 100,
      success: !isError,
      error: isError ? 'Network timeout' : null,
      timestamp,
      memory: {
        percentage: (Math.random() * 40 + 10).toFixed(2)
      },
      cpu: {
        elapsed: timestamp - (now - 3600000)
      }
    });
  }
  return metrics;
}

// Data Fetcher
async function getData(dataSource) {
  if (dataSource === 'real') {
    return getStoredMetrics();
  }
  
  // Mock Mode
  const existing = JSON.parse(sessionStorage.getItem('perfwatch_mock_data') || '[]');
  if (existing.length === 0) {
    const initial = generateMockMetrics(50);
    sessionStorage.setItem('perfwatch_mock_data', JSON.stringify(initial));
    return initial;
  }

  // Add a live mock point
  if (Math.random() > 0.3) {
    const endpoints = ['/api/users', '/api/products', '/api/orders'];
    const now = Date.now();
    existing.push({
      type: 'api_request',
      requestId: `mock_${now}`,
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      method: 'GET',
      status: 200,
      duration: Math.random() * 500 + 50,
      success: true,
      timestamp: now,
      memory: { percentage: (Math.random() * 30 + 20).toFixed(2) }
    });
    if (existing.length > 500) existing.shift();
    sessionStorage.setItem('perfwatch_mock_data', JSON.stringify(existing));
  }
  
  return existing;
}

export async function getSummaryMetrics(dataSource = 'mock') {
  await new Promise(resolve => setTimeout(resolve, 100));
  const metrics = await getData(dataSource);
  
  return {
    summary: processSummary(metrics),
    trends: processTrends(metrics)
  };
}

export async function getLatencyDistribution(dataSource = 'mock') {
  await new Promise(resolve => setTimeout(resolve, 100));
  const metrics = await getData(dataSource);
  return processDistribution(metrics);
}

export async function getHeatmapData(dataSource = 'mock') {
  await new Promise(resolve => setTimeout(resolve, 100));
  const metrics = await getData(dataSource);
  return processHeatmap(metrics);
}

export async function getErrorTraces(dataSource = 'mock') {
  await new Promise(resolve => setTimeout(resolve, 100));
  const metrics = await getData(dataSource);
  
  const errors = metrics.filter(m => 
    m.type === 'error' || (m.type === 'api_request' && !m.success)
  ).sort((a, b) => b.timestamp - a.timestamp); // Newest first

  return errors.map(error => ({
    id: error.requestId || `error_${error.timestamp}`,
    timestamp: error.timestamp,
    type: error.type || 'error',
    endpoint: error.endpoint || 'N/A',
    method: error.method || 'N/A',
    status: error.status || 500,
    message: error.error || error.message || 'Unknown error',
    stack: error.stack || null,
    duration: error.duration || 0
  }));
}

export async function getRequestExplorer({ sortBy, sortOrder, limit, dataSource = 'mock' } = {}) {
  await new Promise(resolve => setTimeout(resolve, 100));
  const metrics = await getData(dataSource);
  
  let apiRequests = metrics.filter(m => m.type === 'api_request');

  if (sortBy) {
    apiRequests.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  } else {
    // Default sort by time desc
    apiRequests.sort((a, b) => b.timestamp - a.timestamp);
  }

  return {
    requests: apiRequests.slice(0, limit || 100),
    total: apiRequests.length
  };
}