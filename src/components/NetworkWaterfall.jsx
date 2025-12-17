import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NetworkWaterfall({ events = [] }) {
  // Guard – no events
  if (!Array.isArray(events) || events.length === 0) return null;

  // Keep last 20 events, sorted newest → oldest
  const cleaned = events
    .filter(e => e && e.timestamp && e.duration !== undefined)
    .slice(-20)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (cleaned.length === 0) return null;

  // Time boundaries
  const minTime = cleaned[0].timestamp;
  const maxTime = Math.max(...cleaned.map(e => e.timestamp + (e.duration || 1)));
  const totalDuration = Math.max(maxTime - minTime, 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Network Waterfall</CardTitle>
          <Badge variant="outline" className="text-xs font-normal">Live View</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mt-3">

          {cleaned.map((event, index) => {
            const safeDuration = Math.max(event.duration || 1, 1);

            const startOffset = ((event.timestamp - minTime) / totalDuration) * 100;
            const width = Math.max((safeDuration / totalDuration) * 100, 2); // min width 2%

            return (
              <div key={event.requestId || index} className="relative h-6 group">

                {/* Endpoint Label */}
                <div
                  className="absolute left-0 top-0 text-[10px] font-mono text-muted-foreground w-28 truncate z-10"
                  title={event.endpoint || 'unknown'}
                >
                  {event.endpoint || 'unknown'}
                </div>

                {/* Bar */}
                <div className="ml-32 h-full relative bg-muted/20 rounded overflow-hidden">
                  <div
                    className={`absolute top-1 bottom-1 rounded-sm transition-all duration-200 ${
                      event.success ? 'bg-[hsl(var(--primary))]' : 'bg-red-600'
                    }`}
                    style={{
                      left: `${startOffset}%`,
                      width: `${width}%`,
                      opacity: 0.85,
                    }}
                  />
                </div>

                {/* Tooltip */}
                <div className="hidden group-hover:flex absolute right-0 top-0 text-[10px] bg-popover text-popover-foreground px-1 py-[1px] rounded shadow-sm border z-20">
                  {Math.round(event.duration)}ms
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
