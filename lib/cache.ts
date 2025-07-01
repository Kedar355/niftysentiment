// Advanced caching system with Redis-like functionality
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    
    // Remove expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      hits: 0,
      lastAccessed: now
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });

    // If still full, remove least recently used
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = Math.floor(this.maxSize * 0.1); // Remove 10%
      for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: entries.length > 0 ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length : 0,
      avgAge: entries.length > 0 ? entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length : 0,
      expired: entries.filter(e => now - e.timestamp > e.ttl).length
    };
  }
}

// Global cache instances
export const stockCache = new AdvancedCache(500, 2 * 60 * 1000); // 2 minutes
export const newsCache = new AdvancedCache(200, 10 * 60 * 1000); // 10 minutes
export const marketDataCache = new AdvancedCache(100, 1 * 60 * 1000); // 1 minute
export const userDataCache = new AdvancedCache(1000, 30 * 60 * 1000); // 30 minutes

// Cache warming function
export const warmCache = async () => {
  console.log('Warming cache...');
  // Pre-load popular stocks and market data
  // This would be called on app startup
};