// Performance optimization utilities for the dashboard
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestQueue = new Map<string, Promise<any>>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Debounced API calls to prevent excessive requests
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => resolve(func(...args)), wait);
      });
    };
  }

  // Request deduplication to prevent duplicate API calls
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Smart caching with TTL
  setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Batch API requests
  async batchRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5,
    delay: number = 100
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
      
      // Add delay between batches to prevent rate limiting
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  // Lazy loading helper
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): IntersectionObserver {
    return new IntersectionObserver(callback, options);
  }

  // Memory cleanup
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Performance monitoring
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  // Async performance monitoring
  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
}

// React hooks for performance optimization
export const usePerformanceOptimizer = () => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  return {
    debounce: optimizer.debounce.bind(optimizer),
    deduplicateRequest: optimizer.deduplicateRequest.bind(optimizer),
    setCache: optimizer.setCache.bind(optimizer),
    getCache: optimizer.getCache.bind(optimizer),
    batchRequests: optimizer.batchRequests.bind(optimizer),
    measurePerformance: optimizer.measurePerformance.bind(optimizer),
    measureAsyncPerformance: optimizer.measureAsyncPerformance.bind(optimizer)
  };
};

// Virtual scrolling for large lists
export class VirtualScrollManager {
  private containerHeight: number;
  private itemHeight: number;
  private overscan: number;

  constructor(containerHeight: number, itemHeight: number, overscan: number = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.overscan = overscan;
  }

  getVisibleRange(scrollTop: number, totalItems: number) {
    const visibleStart = Math.floor(scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(this.containerHeight / this.itemHeight),
      totalItems - 1
    );

    const start = Math.max(0, visibleStart - this.overscan);
    const end = Math.min(totalItems - 1, visibleEnd + this.overscan);

    return { start, end };
  }

  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }

  getItemOffset(index: number): number {
    return index * this.itemHeight;
  }
}

// Image lazy loading
export const createLazyImageLoader = () => {
  const imageCache = new Set<string>();
  
  return {
    loadImage: (src: string): Promise<void> => {
      if (imageCache.has(src)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    preloadImages: async (srcs: string[]): Promise<void> => {
      const promises = srcs
        .filter(src => !imageCache.has(src))
        .map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              imageCache.add(src);
              resolve();
            };
            img.onerror = () => resolve(); // Don't fail on individual image errors
            img.src = src;
          });
        });
      
      await Promise.all(promises);
    }
  };
};

// Bundle size optimization
export const loadComponentLazily = <T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> => {
  return importFn().then(module => module.default);
};

// Memory leak prevention
export class MemoryManager {
  private subscriptions = new Set<() => void>();
  private timers = new Set<NodeJS.Timeout>();
  private observers = new Set<IntersectionObserver | MutationObserver>();

  addSubscription(unsubscribe: () => void): void {
    this.subscriptions.add(unsubscribe);
  }

  addTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer);
  }

  addObserver(observer: IntersectionObserver | MutationObserver): void {
    this.observers.add(observer);
  }

  cleanup(): void {
    // Clear all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();

    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const useMemoryManager = () => {
  const manager = new MemoryManager();
  
  React.useEffect(() => {
    return () => manager.cleanup();
  }, []);
  
  return manager;
};