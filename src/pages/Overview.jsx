import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Clock, AlertTriangle, Activity, Server, Zap } from 'lucide-react';

import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { getSummaryMetrics } from '@/services/mockApi';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useRealtimeWS } from '@/hooks/useRealtimeWS';

import ExportButton from '@/components/ExportButton';
import RealtimeIndicator from '@/components/RealtimeIndicator';
import LiveMetricsStream from '@/components/LiveMetricsStream';
import LiveActivityPanel from '@/components/LiveActivityPanel';
import PerformanceAlerts from '@/components/PerformanceAlerts';
import NetworkWaterfall from '@/components/NetworkWaterfall';

export default function Overview({ refreshInterval, dataSource }) {
  const [liveMode, setLiveMode] = useState(false);

  // Mock / static data polling (5s, etc.)
  const {
    data: standardData,
    loading: standardLoading,
    lastUpdated: standardLastUpdated
  } = useRealtimeMetrics(
    () => getSummaryMetrics(dataSource),
    refreshInterval,
    [dataSource]
  );

  // REAL TIME WebSocket stream
  const {
    events: liveEvents,
    summary: liveSummary
  } = useRealtimeWS(liveMode && dataSource === "real");

  const loading = standardLoading && !liveMode;

  // Determine which dataset to show
  const displayData =
    liveMode && dataSource === "real"
      ? {
          summary: {
            avgLatency: Math.round(liveSummary.avgLatency),
            failureRate: liveSummary.errorRate.toFixed(2),
            totalRequests: liveSummary.totalRequests,
            activeEndpoints: "Live",
          },
          trends: standardData?.trends, // still using mock trends
        }
      : standardData;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Overview - PerfWatch Dashboard</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Overview
            {liveMode && (
              <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
            )}
          </h1>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {liveMode
                ? "Monitoring active sessions in real-time"
                : "Performance metrics and system health"}
            </p>

            {!liveMode && !loading && (
              <RealtimeIndicator
                lastUpdated={standardLastUpdated}
                interval={refreshInterval}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {dataSource === "real" && (
            <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border">
              <Switch
                id="live-mode"
                checked={liveMode}
                onCheckedChange={setLiveMode}
              />
              <Label htmlFor="live-mode" className="font-semibold cursor-pointer">
                Live Mode
              </Label>
            </div>
          )}

          <ExportButton
            data={displayData ? [displayData.summary] : []}
            filename="perfwatch_overview"
            title="Performance Overview"
          />
        </div>
      </div>

      {/* Live Mode Panels */}
      {liveMode && dataSource === "real" && (
        <>
          <LiveActivityPanel metrics={liveSummary} />
          <PerformanceAlerts metrics={liveSummary} />
        </>
      )}

      {/* Metric Cards (only in non-live mode) */}
      {!liveMode && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Avg Latency"
            value={loading ? "-" : `${displayData?.summary.avgLatency || 0}ms`}
            icon={Clock}
            trend={dataSource === "real" ? "Real-time" : "Simulated"}
            loading={loading}
          />

          <MetricCard
            title="Failure Rate"
            value={loading ? "-" : `${displayData?.summary.failureRate || 0}%`}
            icon={AlertTriangle}
            trend="Error percentage"
            loading={loading}
          />

          <MetricCard
            title="API Calls"
            value={
              loading
                ? "-"
                : (displayData?.summary.totalRequests || 0).toLocaleString()
            }
            icon={Activity}
            trend="Total requests"
            loading={loading}
          />

          <MetricCard
            title="Active Endpoints"
            value={loading ? "-" : displayData?.summary.activeEndpoints || 0}
            icon={Server}
            trend="Monitored endpoints"
            loading={loading}
          />
        </div>
      )}

      {/* Real-time Visualization Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Waterfall or Memory Chart */}
        <div className="md:col-span-2 space-y-4">
          {liveMode && dataSource === "real" ? (
            <NetworkWaterfall events={liveEvents} />
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <LineChart
                    data={displayData?.trends?.memory || []}
                    dataKey="memory"
                    strokeColor="#10b981"
                    height={200}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {!liveMode && (
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage (Est.)</CardTitle>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <LineChart
                    data={displayData?.trends?.cpu || []}
                    dataKey="cpu"
                    strokeColor="#3b82f6"
                    height={200}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Event Stream */}
        <div className="md:col-span-1">
          {liveMode && dataSource === "real" ? (
            <LiveMetricsStream events={liveEvents} />
          ) : (
            <Card className="h-full bg-muted/10 border-dashed flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="font-semibold mb-1">Live Feed Paused</h3>
              <p className="text-sm mb-4">
                Enable Live Mode with Real SDK data to see events instantly.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
