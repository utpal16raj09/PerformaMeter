import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getHeatmapData } from '@/services/mockApi';
import { cn } from '@/lib/utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import ExportButton from '@/components/ExportButton';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function LatencyHeatmap({ refreshInterval, dataSource }) {
  const { data, loading, lastUpdated } = useRealtimeMetrics(
    () => getHeatmapData(dataSource), 
    refreshInterval, 
    [dataSource]
  );
  
  const heatmapData = data?.heatmapData || [];
  const endpoints = data?.endpoints || [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColorForLatency = (latency) => {
    if (latency < 200) return 'bg-green-500';
    if (latency < 500) return 'bg-yellow-500';
    if (latency < 1000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Latency Heatmap - PerfWatch Dashboard</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Latency Heatmap</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Visual representation of latency across endpoints and time
            </p>
            {!loading && <RealtimeIndicator lastUpdated={lastUpdated} interval={refreshInterval} />}
          </div>
        </div>
        <ExportButton 
          data={heatmapData} 
          filename="latency_heatmap" 
          title="Latency Heatmap Data"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hourly Latency Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : endpoints.length === 0 ? (
             <div className="h-[300px] flex items-center justify-center text-muted-foreground">
               No latency data available for heatmap
             </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-25 gap-1 mb-4">
                  <div className="col-span-1"></div>
                  {hours.map(hour => (
                    <div key={hour} className="text-xs text-center text-muted-foreground">
                      {hour}h
                    </div>
                  ))}
                </div>

                {endpoints.map(endpoint => (
                  <div key={endpoint} className="grid grid-cols-25 gap-1 mb-2">
                    <div className="col-span-1 text-xs flex items-center pr-2 truncate" title={endpoint}>
                      {endpoint.split('/').pop()}
                    </div>
                    {hours.map(hour => {
                      const cell = heatmapData.find(
                        d => d.endpoint === endpoint && d.hour === hour
                      );
                      return (
                        <div
                          key={hour}
                          className={cn(
                            "h-8 rounded transition-all hover:scale-110 cursor-pointer",
                            cell ? getColorForLatency(cell.avgLatency) : 'bg-muted/20'
                          )}
                          title={cell ? `${cell.avgLatency}ms (${cell.count} requests)` : 'No data'}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}