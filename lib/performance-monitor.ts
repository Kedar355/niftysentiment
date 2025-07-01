// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring() {
    // Monitor API response times
    this.observeResourceTiming();
    
    // Monitor component render times
    this.observeMeasures();
    
    // Monitor user interactions
    this.observeUserTiming();
  }

  private observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.includes('/api/')) {
          this.recordMetric(`api_${this.extractApiEndpoint(entry.name)}`, entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observeMeasures() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.recordMetric(`measure_${entry.name}`, entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  private observeUserTiming() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'mark') {
          this.recordMetric(`mark_${entry.name}`, entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['mark'] });
    this.observers.push(observer);
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics() {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          count: values.length,
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        };
      }
    });
    
    return result;
  }

  private extractApiEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace('/api/', '').replace(/\//g, '_');
    } catch {
      return 'unknown';
    }
  }

  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  const startTimer = (name: string) => {
    performance.mark(`${name}_start`);
    return () => {
      performance.mark(`${name}_end`);
      performance.measure(name, `${name}_start`, `${name}_end`);
    };
  };

  const recordMetric = (name: string, value: number) => {
    monitor.recordMetric(name, value);
  };

  return { startTimer, recordMetric, getMetrics: () => monitor.getMetrics() };
};

// API response time decorator
export const withPerformanceTracking = (apiCall: Function, endpoint: string) => {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await apiCall(...args);
      const duration = performance.now() - start;
      PerformanceMonitor.getInstance().recordMetric(`api_${endpoint}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      PerformanceMonitor.getInstance().recordMetric(`api_${endpoint}_error`, duration);
      throw error;
    }
  };
};