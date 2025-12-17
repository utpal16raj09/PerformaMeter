import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BarChart from '@/components/charts/BarChart';
import MetricCard from '@/components/MetricCard';
import { getLatencyDistribution } from '@/services/mockApi';
import { TrendingUp } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import ExportButton from '@/components/ExportButton';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function LatencyDistribution({ refreshInterval, dataSource }) {
  const { data, loading, lastUpdated } = useRealtimeMetrics(
    () => getLatencyDistribution(dataSource), 
    refreshInterval, 
    [dataSource]
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Latency Distribution - PerfWatch Dashboard</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Latency Distribution</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Percentile-based latency analysis
            </p>
            {!loading && <RealtimeIndicator lastUpdated={lastUpdated} interval={refreshInterval} />}
          </div>
        </div>
        <ExportButton 
          data={data?.distribution} 
          filename="latency_distribution" 
          title="Latency Distribution"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="P50 (Median)"
          value={loading ? '-' : `${data?.percentiles.p50 || 0}ms`}
          icon={TrendingUp}
          trend="50th percentile"
          loading={loading}
        />
        <MetricCard
          title="P90"
          value={loading ? '-' : `${data?.percentiles.p90 || 0}ms`}
          icon={TrendingUp}
          trend="90th percentile"
          loading={loading}
        />
        <MetricCard
          title="P95"
          value={loading ? '-' : `${data?.percentiles.p95 || 0}ms`}
          icon={TrendingUp}
          trend="95th percentile"
          loading={loading}
        />
        <MetricCard
          title="P99"
          value={loading ? '-' : `${data?.percentiles.p99 || 0}ms`}
          icon={TrendingUp}
          trend="99th percentile"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Percentile Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <BarChart
              data={data?.distribution || []}
              dataKey="latency"
              fill="#6366f1"
              height={400}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}