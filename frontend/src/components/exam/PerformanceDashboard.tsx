import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PerformanceMetrics } from '../../hooks/usePerformanceMetrics';

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  onExportReport: () => string;
}

/**
 * Developer performance dashboard
 * Shows real-time performance metrics and Core Web Vitals
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
  onExportReport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'vitals' | 'performance' | 'interaction'>('vitals');

  // Only show in development or when explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    localStorage.getItem('performance-dashboard') === 'enabled';

  if (!shouldShow) return null;

  const formatTime = (time: number | null) => {
    if (time === null) return 'N/A';
    return `${time.toFixed(2)}ms`;
  };

  const formatMemory = (memory: number | null) => {
    if (memory === null) return 'N/A';
    return `${memory.toFixed(2)}MB`;
  };

  const getVitalStatus = (metric: string, value: number | null) => {
    if (value === null) return 'unknown';
    
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'lcp':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportReport = () => {
    const report = onExportReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Performance Dashboard"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-chart-line'}`}></i>
      </motion.button>

      {/* Dashboard Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 left-0 w-96 bg-white rounded-lg shadow-xl border"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Performance Metrics
                </h3>
                <button
                  onClick={exportReport}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  title="Export Report"
                >
                  <i className="fas fa-download mr-1"></i>
                  Export
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-3">
                {[
                  { key: 'vitals', label: 'Core Vitals', icon: 'fa-heartbeat' },
                  { key: 'performance', label: 'Performance', icon: 'fa-tachometer-alt' },
                  { key: 'interaction', label: 'Interaction', icon: 'fa-mouse-pointer' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded text-xs ${
                      selectedTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <i className={`fas ${tab.icon}`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {selectedTab === 'vitals' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Core Web Vitals</h4>
                  
                  {[
                    { key: 'fcp', label: 'First Contentful Paint', value: metrics.fcp },
                    { key: 'lcp', label: 'Largest Contentful Paint', value: metrics.lcp },
                    { key: 'fid', label: 'First Input Delay', value: metrics.fid },
                    { key: 'cls', label: 'Cumulative Layout Shift', value: metrics.cls },
                  ].map((vital) => {
                    const status = getVitalStatus(vital.key, vital.value);
                    return (
                      <div key={vital.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{vital.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono">
                            {vital.key === 'cls' 
                              ? vital.value?.toFixed(3) || 'N/A'
                              : formatTime(vital.value)
                            }
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                            {status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTab === 'performance' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Application Performance</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600">Page Load</div>
                      <div className="text-sm font-mono">{formatTime(metrics.pageLoadTime)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600">Component Mount</div>
                      <div className="text-sm font-mono">{formatTime(metrics.componentMountTime)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600">Memory Usage</div>
                      <div className="text-sm font-mono">{formatMemory(metrics.memoryUsage)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600">Avg Response</div>
                      <div className="text-sm font-mono">{formatTime(metrics.averageResponseTime)}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'interaction' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">User Interaction</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xs text-blue-600">Total Clicks</div>
                      <div className="text-lg font-bold text-blue-800">{metrics.totalClicks}</div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xs text-green-600">Keystrokes</div>
                      <div className="text-lg font-bold text-green-800">{metrics.totalKeystrokes}</div>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-xs text-purple-600">Navigation</div>
                      <div className="text-lg font-bold text-purple-800">{metrics.navigationCount}</div>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <div className="text-xs text-orange-600">Answers/Min</div>
                      <div className="text-lg font-bold text-orange-800">{metrics.answersPerMinute.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600">Avg Question Time</div>
                    <div className="text-sm font-mono">{formatTime(metrics.averageQuestionTime)}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};