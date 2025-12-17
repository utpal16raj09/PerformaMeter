import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Activity, RefreshCw, Trash2, Globe, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getStoredMetrics, clearStoredMetrics } from '@/utils/sdkDataProcessor';
import PerfWatch from 'sdk/perfwatch.js';

export default function SDKIntegrationPanel({ isOpen, onClose }) {
    const { toast } = useToast();
    const [metricsCount, setMetricsCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [sdkActive, setSdkActive] = useState(false);
    const [rawMetrics, setRawMetrics] = useState([]);

    // Auto-refresh metrics view
    useEffect(() => {
        if (!isOpen) return;

        // Check if SDK is attached to window
        setSdkActive(!!window.PerfWatchInstance);

        const loadMetrics = () => {
            const metrics = getStoredMetrics();
            setRawMetrics(metrics.slice(-50).reverse()); // Show last 50
            setMetricsCount(metrics.length);
            if (metrics.length > 0) {
                setLastUpdate(metrics[metrics.length - 1].timestamp);
            }
        };

        loadMetrics();
        const interval = setInterval(loadMetrics, 2000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const initSDK = () => {
        if (!window.PerfWatchInstance) {
            window.PerfWatchInstance = new PerfWatch({
                enabled: true,
                batchSize: 5,
                flushInterval: 2000,
                wsUrl: "ws://localhost:4000"
            });

            setSdkActive(true);
            toast({ title: "SDK Initialized", description: "PerfWatch SDK is now running." });
        }
    };

    const simulateRequest = async () => {
        if (!window.PerfWatchInstance) initSDK();

        // Use SDK tracker manually or rely on SDK's fetch patch if implemented
        const tracker = window.PerfWatchInstance.trackRequest('/api/test-data', { method: 'GET' });

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

            // Random success/fail
            if (Math.random() > 0.8) throw new Error("Random test error");

            tracker.end(200);
            toast({ title: "Request Tracked", description: "GET /api/test-data (200 OK)" });
        } catch (err) {
            tracker.end(500, err.message);
            toast({ title: "Error Tracked", description: "GET /api/test-data (500 Error)", variant: "destructive" });
        }
    };

    const copyCode = () => {
        const code = `import PerfWatch from './sdk/perfwatch.js';\n\nconst perfwatch = new PerfWatch({\n  enabled: true,\n  endpoint: '/api/metrics'\n});`;
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: "SDK initialization code copied to clipboard." });
    };

    const handleClearData = () => {
        clearStoredMetrics();
        setRawMetrics([]);
        setMetricsCount(0);
        toast({ title: "Cleared", description: "Local metrics storage cleared." });
    };

    return (
        <Card className="h-full border-l rounded-none shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            SDK Integration
                        </CardTitle>
                        <CardDescription>Connect real applications to PerfWatch</CardDescription>
                    </div>
                    <Badge variant={sdkActive ? "success" : "secondary"} className={sdkActive ? "bg-green-500 hover:bg-green-600" : ""}>
                        {sdkActive ? "Connected" : "Not Initialized"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger value="status" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Status</TabsTrigger>
                        <TabsTrigger value="setup" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Setup Guide</TabsTrigger>
                        <TabsTrigger value="data" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Raw Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg bg-muted/20">
                                <div className="text-sm text-muted-foreground">Total Metrics</div>
                                <div className="text-2xl font-bold">{metricsCount}</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-muted/20">
                                <div className="text-sm text-muted-foreground">Last Activity</div>
                                <div className="text-sm font-medium truncate">
                                    {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Test Tools</h3>
                            <div className="flex gap-2">
                                <Button onClick={initSDK} disabled={sdkActive} className="flex-1">
                                    {sdkActive ? "SDK Running" : "Initialize SDK"}
                                </Button>
                                <Button onClick={simulateRequest} variant="secondary" className="flex-1">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Simulate Request
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="setup" className="p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Installation</h3>
                                <Button variant="ghost" size="icon" onClick={copyCode}><Copy className="h-4 w-4" /></Button>
                            </div>
                            <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                                {`import PerfWatch from './sdk/perfwatch.js';

const perfwatch = new PerfWatch({
  enabled: true,
  batchSize: 50,
  flushInterval: 5000
});

// Auto-tracks page loads & resources
// Manual tracking:
perfwatch.trackRequest('/api/data');`}
                            </pre>
                        </div>
                    </TabsContent>

                    <TabsContent value="data" className="p-0">
                        <div className="border-b p-2 flex justify-end">
                            <Button variant="ghost" size="sm" onClick={handleClearData} className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Clear Data
                            </Button>
                        </div>
                        <ScrollArea className="h-[400px]">
                            <div className="p-4 space-y-2">
                                {rawMetrics.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        No metrics collected yet.
                                    </div>
                                )}
                                {rawMetrics.map((m, i) => (
                                    <div key={i} className="text-xs font-mono p-2 border rounded hover:bg-muted/50">
                                        <div className="flex justify-between text-muted-foreground mb-1">
                                            <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                                            <span>{m.type}</span>
                                        </div>
                                        <div className="truncate text-foreground">
                                            {m.endpoint || m.name || m.message}
                                            {m.status && <span className={`ml-2 ${m.success ? 'text-green-500' : 'text-red-500'}`}>{m.status}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}