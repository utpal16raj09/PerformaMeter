import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveMetricsStream({ events = [], limit = 20 }) {
  const scrollRef = useRef(null);

  // CLEAN + LIMIT EVENTS SAFELY
  const sanitized = events
    .filter(e => e && e.timestamp && e.endpoint) // remove nulls or broken packets
    .slice(-limit)
    .reverse(); // newest first

  useEffect(() => {
    // AUTO SCROLL TO TOP FOR NEW EVENTS
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [sanitized.length]);

  const getIcon = (event) => {
    if (!event.success) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if ((event.duration || 0) > 1000) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-[hsl(var(--primary))]" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
            Live Event Feed
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal">Real-time</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
          <div className="space-y-2">

            <AnimatePresence initial={false}>
              {sanitized.map((event, index) => (
                <motion.div
                  key={event.requestId || `${event.timestamp}-${index}`}
                  initial={{ opacity: 0, scale: 0.98, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border text-xs shadow-sm",
                    !event.success
                      ? "bg-red-500/10 border-red-500/20"
                      : event.duration > 1000
                      ? "bg-yellow-400/10 border-yellow-400/20"
                      : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getIcon(event)}

                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-semibold truncate">
                        {event.endpoint}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(event.timestamp).toLocaleTimeString()} • {event.method || "GET"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge
                      variant={!event.success ? "destructive" : "secondary"}
                      className="text-[10px] px-1 h-4"
                    >
                      {event.status || "-"}
                    </Badge>

                    <span
                      className={cn(
                        "font-mono font-medium",
                        event.duration > 1000
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {Math.round(event.duration || 0)}ms
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sanitized.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-xs">
                Waiting for events...
              </div>
            )}

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
