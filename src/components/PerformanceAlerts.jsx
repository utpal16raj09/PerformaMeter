import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Safe helper
const safe = (value, fallback = 0) =>
  typeof value === "number" && !isNaN(value) ? value : fallback;

export default function PerformanceAlerts({ metrics = {} }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const avgLatency = safe(metrics.avgLatency);
    const errorRate = safe(metrics.errorRate);
    const memoryUsage = safe(metrics.memoryUsage);

    const newAlerts = [];

    if (avgLatency > 1000) {
      newAlerts.push({
        id: 'latency-high',
        title: 'High Latency Detected',
        message: `Average response time is ${Math.round(avgLatency)}ms (Threshold: 1000ms)`,
        type: 'destructive'
      });
    }

    if (errorRate > 10) {
      newAlerts.push({
        id: 'error-rate-high',
        title: 'Critical Error Rate',
        message: `Error rate has spiked to ${errorRate.toFixed(1)}%`,
        type: 'destructive'
      });
    }

    if (memoryUsage > 80) {
      newAlerts.push({
        id: 'memory-high',
        title: 'High Memory Usage',
        message: `Heap usage is at ${memoryUsage.toFixed(1)}%`,
        type: 'warning'
      });
    }

    setAlerts(newAlerts);
  }, [
    metrics.avgLatency,
    metrics.errorRate,
    metrics.memoryUsage
  ]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <Alert 
              variant={alert.type === 'destructive' ? 'destructive' : 'default'} 
              className="bg-background/95 backdrop-blur shadow-xl border-l-4"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
