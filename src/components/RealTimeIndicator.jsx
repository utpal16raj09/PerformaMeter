import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

export default function RealtimeIndicator({ lastUpdated, interval }) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>Updated {secondsAgo}s ago</span>
      <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal">
        <RefreshCw className="mr-1 h-3 w-3" />
        {interval / 1000}s
      </Badge>
    </div>
  );
}