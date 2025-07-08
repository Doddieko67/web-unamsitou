import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  
  // Application specific
  pageLoadTime: number | null;
  componentMountTime: number | null;
  memoryUsage: number | null;
  timerAccuracy: number | null;
  responseTime: number | null;
  
  // User interaction
  totalClicks: number;
  totalKeystrokes: number;
  averageResponseTime: number;
  
  // Exam specific
  answersPerMinute: number;
  navigationCount: number;
  averageQuestionTime: number;
}

export interface PerformanceActions {
  recordClick: () => void;
  recordKeystroke: () => void;
  recordQuestionAnswer: () => void;
  recordNavigation: () => void;
  recordResponseTime: (time: number) => void;
  startQuestionTimer: () => void;
  endQuestionTimer: () => void;
  getMetricsReport: () => string;
}

export interface UsePerformanceMetricsReturn extends PerformanceMetrics, PerformanceActions {}

/**
 * Custom hook for performance metrics and monitoring
 * Tracks Core Web Vitals and application-specific performance data
 */
export const usePerformanceMetrics = (): UsePerformanceMetricsReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    pageLoadTime: null,
    componentMountTime: null,
    memoryUsage: null,
    timerAccuracy: null,
    responseTime: null,
    totalClicks: 0,
    totalKeystrokes: 0,
    averageResponseTime: 0,
    answersPerMinute: 0,
    navigationCount: 0,
    averageQuestionTime: 0,
  });

  const mountTime = useRef(Date.now());
  const questionStartTime = useRef<number | null>(null);
  const responseTimes = useRef<number[]>([]);
  const questionTimes = useRef<number[]>([]);
  const interactionStartTime = useRef(Date.now());

  // Initialize performance monitoring
  useEffect(() => {
    initializeWebVitals();
    measurePageLoad();
    measureMemoryUsage();
    
    // Component mount time
    const componentLoadTime = Date.now() - mountTime.current;
    setMetrics(prev => ({
      ...prev,
      componentMountTime: componentLoadTime,
    }));

    // Memory monitoring interval
    const memoryInterval = setInterval(measureMemoryUsage, 10000); // Every 10 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // Initialize Core Web Vitals measurement
  const initializeWebVitals = () => {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry.processingStart && lastEntry.startTime) {
            setMetrics(prev => ({ ...prev, fid: lastEntry.processingStart - lastEntry.startTime }));
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as any;
            if (!layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value || 0;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.log('Performance Observer not fully supported:', error);
      }
    }
  };

  const measurePageLoad = () => {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (loadTime > 0) {
        setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      }
    }
  };

  const measureMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      // @ts-ignore - memory API is not standardized
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
      }
    }
  }, []);

  const recordClick = useCallback(() => {
    setMetrics(prev => ({ ...prev, totalClicks: prev.totalClicks + 1 }));
  }, []);

  const recordKeystroke = useCallback(() => {
    setMetrics(prev => ({ ...prev, totalKeystrokes: prev.totalKeystrokes + 1 }));
  }, []);

  const recordQuestionAnswer = useCallback(() => {
    const now = Date.now();
    const sessionTime = (now - interactionStartTime.current) / 1000 / 60; // minutes
    
    setMetrics(prev => {
      const newAnswerCount = prev.totalClicks + prev.totalKeystrokes;
      const apm = sessionTime > 0 ? newAnswerCount / sessionTime : 0;
      return { ...prev, answersPerMinute: apm };
    });
  }, []);

  const recordNavigation = useCallback(() => {
    setMetrics(prev => ({ ...prev, navigationCount: prev.navigationCount + 1 }));
  }, []);

  const recordResponseTime = useCallback((time: number) => {
    responseTimes.current.push(time);
    const avgTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length;
    
    setMetrics(prev => ({
      ...prev,
      responseTime: time,
      averageResponseTime: avgTime,
    }));
  }, []);

  const startQuestionTimer = useCallback(() => {
    questionStartTime.current = Date.now();
  }, []);

  const endQuestionTimer = useCallback(() => {
    if (questionStartTime.current) {
      const questionTime = Date.now() - questionStartTime.current;
      questionTimes.current.push(questionTime);
      
      const avgQuestionTime = questionTimes.current.reduce((a, b) => a + b, 0) / questionTimes.current.length;
      
      setMetrics(prev => ({
        ...prev,
        averageQuestionTime: avgQuestionTime,
      }));
      
      questionStartTime.current = null;
    }
  }, []);

  const getMetricsReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      sessionDuration: (Date.now() - interactionStartTime.current) / 1000,
      coreWebVitals: {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
      },
      performance: {
        pageLoadTime: metrics.pageLoadTime,
        componentMountTime: metrics.componentMountTime,
        memoryUsage: metrics.memoryUsage,
        averageResponseTime: metrics.averageResponseTime,
      },
      userInteraction: {
        totalClicks: metrics.totalClicks,
        totalKeystrokes: metrics.totalKeystrokes,
        navigationCount: metrics.navigationCount,
        answersPerMinute: metrics.answersPerMinute,
        averageQuestionTime: metrics.averageQuestionTime,
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      },
    };

    return JSON.stringify(report, null, 2);
  }, [metrics]);

  // Global error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Performance: JavaScript error detected', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Performance: Unhandled promise rejection', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return {
    ...metrics,
    recordClick,
    recordKeystroke,
    recordQuestionAnswer,
    recordNavigation,
    recordResponseTime,
    startQuestionTimer,
    endQuestionTimer,
    getMetricsReport,
  };
};