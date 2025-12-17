import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, AlertTriangle, Cpu, Database } from 'lucide-react';

// Safe helper to avoid crashes
const safe = (value, fallback = 0) =>
  typeof value === "number" && !isNaN(value) ? value : fallback;

export default function LiveActivityPanel({ metrics = {} }) {
  // Sanitize all values
  const avgLatency = safe(metrics.avgLatency);
  const errorRate = safe(metrics.errorRate);
  const memoryUsage = safe(metrics.memoryUsage);
  const totalRequests = safe(metrics.totalRequests);

  // Threshold logic
  const latencyStatus =
    avgLatency > 1000 ? "destructive" :
    avgLatency > 500 ? "warning" : "success";

  const errorStatus =
    errorRate > 5 ? "destructive" :
    errorRate > 1 ? "warning" : "success";

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

      {/* Memory / CPU Load */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            System Load
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {memoryUsage.toFixed(1)}%
          </div>
          <Progress value={memoryUsage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">JS Heap Usage (Est.)</p>
        </CardContent>
      </Card>

      {/* Latency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Live Latency
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold mb-2 ${
              latencyStatus === "destructive"
                ? "text-red-500"
                : latencyStatus === "warning"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {avgLatency.toFixed(0)}ms
          </div>
          <p className="text-xs text-muted-foreground">Average of recent requests</p>
        </CardContent>
      </Card>

      {/* Error Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Error Rate
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold mb-2 ${
              errorStatus === "destructive"
                ? "text-red-500"
                : errorStatus === "warning"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {errorRate.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">Failure percentage (Real-time)</p>
        </CardContent>
      </Card>

      {/* Total Requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Throughput
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {totalRequests.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total captured events</p>
        </CardContent>
      </Card>

    </div>
  );
}
