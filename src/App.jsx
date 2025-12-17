import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Overview from '@/pages/Overview';
import LatencyHeatmap from '@/pages/LatencyHeatmap';
import LatencyDistribution from '@/pages/LatencyDistribution';
import ErrorTraces from '@/pages/ErrorTraces';
import RequestExplorer from '@/pages/RequestExplorer';
import SDKIntegrationPanel from '@/components/SDKIntegrationPanel';
import { Toaster } from '@/components/ui/toaster';
import { Sheet, SheetContent } from '@/components/ui/sheet';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [dataSource, setDataSource] = useState('mock'); // 'mock' or 'real'
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          dataSource={dataSource}
          setDataSource={setDataSource}
          onOpenIntegration={() => setIsIntegrationOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto relative">
          {/* Global Data Source Indicator */}
          <div className="absolute top-0 right-0 p-2 z-10 pointer-events-none">
             <div className={`px-3 py-1 rounded-bl-lg text-xs font-bold shadow-sm border-l border-b ${
               dataSource === 'real' 
                 ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                 : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
             }`}>
               Data Source: {dataSource === 'real' ? 'Real SDK' : 'Mock'}
             </div>
          </div>

          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Overview refreshInterval={refreshInterval} dataSource={dataSource} />} />
              <Route path="/heatmap" element={<LatencyHeatmap refreshInterval={refreshInterval} dataSource={dataSource} />} />
              <Route path="/distribution" element={<LatencyDistribution refreshInterval={refreshInterval} dataSource={dataSource} />} />
              <Route path="/errors" element={<ErrorTraces refreshInterval={refreshInterval} dataSource={dataSource} />} />
              <Route path="/explorer" element={<RequestExplorer refreshInterval={refreshInterval} dataSource={dataSource} />} />
            </Routes>
          </div>
        </main>

        <Sheet open={isIntegrationOpen} onOpenChange={setIsIntegrationOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l">
            <SDKIntegrationPanel isOpen={isIntegrationOpen} onClose={() => setIsIntegrationOpen(false)} />
          </SheetContent>
        </Sheet>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;