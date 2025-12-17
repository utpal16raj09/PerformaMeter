import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getErrorTraces } from '@/services/mockApi';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import ExportButton from '@/components/ExportButton';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function ErrorTraces({ refreshInterval, dataSource }) {
  const { data: errors, loading, lastUpdated } = useRealtimeMetrics(
    () => getErrorTraces(dataSource), 
    refreshInterval, 
    [dataSource]
  );
  
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadgeVariant = (status) => {
    if (status >= 500) return 'destructive';
    if (status >= 400) return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Error Traces - PerfWatch Dashboard</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Traces</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Detailed error logs and stack traces
            </p>
            {!loading && <RealtimeIndicator lastUpdated={lastUpdated} interval={refreshInterval} />}
          </div>
        </div>
        <ExportButton 
          data={errors} 
          filename="error_traces" 
          title="Error Logs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors ({errors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !errors || errors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No errors found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error) => {
                  const isExpanded = expandedRows.has(error.id);
                  return (
                    <React.Fragment key={error.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRow(error.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(error.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {error.endpoint}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{error.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(error.status)}>
                            {error.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{Math.round(error.duration)}ms</TableCell>
                        <TableCell className="max-w-md truncate">
                          {error.message}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            <div className="p-4 space-y-2">
                              <div>
                                <span className="font-semibold">Error ID:</span>{' '}
                                <span className="font-mono text-xs">{error.id}</span>
                              </div>
                              <div>
                                <span className="font-semibold">Type:</span>{' '}
                                {error.type}
                              </div>
                              <div>
                                <span className="font-semibold">Full Message:</span>{' '}
                                <p className="mt-1 text-sm">{error.message}</p>
                              </div>
                              {error.stack && (
                                <div>
                                  <span className="font-semibold">Stack Trace:</span>
                                  <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                    {error.stack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}