import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRequestExplorer } from '@/services/mockApi';
import { ArrowUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import ExportButton from '@/components/ExportButton';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function RequestExplorer({ refreshInterval, dataSource }) {
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetcher = () => getRequestExplorer({ sortBy, sortOrder, limit: 100, dataSource });
  const { data, loading, lastUpdated } = useRealtimeMetrics(fetcher, refreshInterval, [sortBy, sortOrder, dataSource]);
  const requests = data?.requests || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (status >= 500) return 'destructive';
    if (status >= 400) return 'warning';
    if (status >= 200 && status < 300) return 'success';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Request Explorer - PerfWatch Dashboard</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Explorer</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Detailed view of all API requests
            </p>
            {!loading && <RealtimeIndicator lastUpdated={lastUpdated} interval={refreshInterval} />}
          </div>
        </div>
        <ExportButton 
          data={requests} 
          filename="request_explorer" 
          title="API Requests Log"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Requests ({requests.length})</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : requests.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">No requests logged</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('timestamp')}
                          className="h-8 w-full justify-start"
                        >
                          Time
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('status')}
                          className="h-8 w-full justify-start"
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('duration')}
                          className="h-8 w-full justify-start"
                        >
                          Duration
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow
                        key={request.requestId}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedRequest?.requestId === request.requestId && "bg-muted"
                        )}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <TableCell className="text-xs">
                          {new Date(request.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-xs truncate">
                          {request.endpoint}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{Math.round(request.duration || 0)}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Request ID</span>
                  <p className="font-mono text-xs mt-1">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Endpoint</span>
                  <p className="font-mono text-sm mt-1">{selectedRequest.endpoint}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Method</span>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedRequest.method}</Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Status</span>
                  <p className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Duration</span>
                  <p className="text-lg font-bold mt-1">{Math.round(selectedRequest.duration || 0)}ms</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Timestamp</span>
                  <p className="text-sm mt-1">{new Date(selectedRequest.timestamp).toLocaleString()}</p>
                </div>
                {selectedRequest.memory && (
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">Memory Usage</span>
                    <p className="text-sm mt-1">{selectedRequest.memory.percentage}%</p>
                  </div>
                )}
                {selectedRequest.error && (
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">Error</span>
                    <p className="text-sm text-red-500 mt-1">{selectedRequest.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a request to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}