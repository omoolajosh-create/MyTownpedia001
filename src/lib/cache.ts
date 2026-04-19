// Simple in-memory cache with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>>;

  constructor() {
    this.storage = new Map();
  }

  set<T>(key: string, data: T, ttl: number = 300000) { // Default 5 minutes
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) return null;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.storage.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string) {
    this.storage.delete(key);
  }

  clear() {
    this.storage.clear();
  }

  has(key: string): boolean {
    const item = this.storage.get(key);
    if (!item) return false;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.storage.delete(key);
      return false;
    }
    
    return true;
  }
}

export const cache = new Cache();

// React Query cache helper
export const getCacheKey = (prefix: string, ...params: (string | number)[]) => {
  return [prefix, ...params].join(':');
};
