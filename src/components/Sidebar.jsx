import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  AlertCircle, 
  Search,
  Moon,
  Sun,
  Timer,
  Database,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Latency Heatmap', href: '/heatmap', icon: Activity },
  { name: 'Latency Distribution', href: '/distribution', icon: BarChart3 },
  { name: 'Error Traces', href: '/errors', icon: AlertCircle },
  { name: 'Request Explorer', href: '/explorer', icon: Search },
];

export default function Sidebar({ 
  darkMode, 
  toggleDarkMode, 
  refreshInterval, 
  setRefreshInterval,
  dataSource,
  setDataSource,
  onOpenIntegration
}) {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">PerfWatch</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-4">
        {/* Data Source Toggle */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Data Source</Label>
            <Database className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="data-mode" 
              checked={dataSource === 'real'}
              onCheckedChange={(c) => setDataSource(c ? 'real' : 'mock')}
            />
            <Label htmlFor="data-mode" className="text-xs font-normal">
              {dataSource === 'real' ? 'Real SDK' : 'Mock Data'}
            </Label>
          </div>
          {dataSource === 'real' && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full text-xs h-7"
              onClick={onOpenIntegration}
            >
              <Radio className="w-3 h-3 mr-1" /> Integration
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Timer className="h-4 w-4" />
              <span>Update: {refreshInterval / 1000}s</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {[2000, 5000, 10000, 30000].map((ms) => (
              <DropdownMenuItem key={ms} onClick={() => setRefreshInterval(ms)}>
                {ms / 1000} Seconds
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="w-full justify-start gap-2"
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}