import fs from 'fs';
import path from 'path';

interface CacheConfig {
  ttl: number;
  maxSize: number;
  syncInterval: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  dirty: boolean;
}

class CacheManager {
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: Map<string, CacheConfig> = new Map();
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.setupGracefulShutdown();
  }

  registerCache(cacheName: string, config: Partial<CacheConfig> = {}) {
    const defaultConfig: CacheConfig = {
      ttl: 5 * 60 * 1000,
      maxSize: 1000,
      syncInterval: 10000,
      ...config
    };

    this.config.set(cacheName, defaultConfig);
    this.caches.set(cacheName, new Map());

    const syncTimer = setInterval(() => {
      this.syncCache(cacheName);
    }, defaultConfig.syncInterval);

    this.syncTimers.set(cacheName, syncTimer);
  }

  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const entry = cache.get(key);
    if (!entry) return null;

    const config = this.config.get(cacheName);
    if (config && Date.now() - entry.timestamp > config.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(cacheName: string, key: string, data: T, dirty = true): void {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      console.warn(`Cache ${cacheName} not registered`);
      return;
    }

    const config = this.config.get(cacheName);
    if (config && cache.size >= config.maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        const oldEntry = cache.get(oldestKey);
        if (oldEntry?.dirty) {
          this.flushEntry(cacheName, oldestKey, oldEntry.data);
        }
        cache.delete(oldestKey);
      }
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      dirty
    });
  }

  getOrLoad<T>(cacheName: string, key: string, filename: string, defaultValue: T): T {
    let cached = this.get<T>(cacheName, key);
    if (cached !== null) return cached;

    const filePath = path.join(this.dataDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        if (fileData.trim()) {
          const parsed = JSON.parse(fileData);
          const value = parsed[key] || defaultValue;
          this.set(cacheName, key, value, false);
          return value;
        }
      }
    } catch (error: any) {
      console.error(`Error loading ${filename}:`, error.message);
    }

    this.set(cacheName, key, defaultValue, false);
    return defaultValue;
  }

  invalidate(cacheName: string, key?: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    if (key) {
      const entry = cache.get(key);
      if (entry?.dirty) {
        this.flushEntry(cacheName, key, entry.data);
      }
      cache.delete(key);
    } else {
      this.syncCache(cacheName);
      cache.clear();
    }
  }

  private syncCache(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    const dirtyEntries: Array<[string, any]> = [];
    
    for (const [key, entry] of cache.entries()) {
      if (entry.dirty) {
        dirtyEntries.push([key, entry.data]);
        entry.dirty = false;
        entry.timestamp = Date.now();
      }
    }

    if (dirtyEntries.length > 0) {
      this.bulkWrite(cacheName, dirtyEntries);
    }
  }

  private bulkWrite(cacheName: string, entries: Array<[string, any]>): void {
    const filename = this.getFilenameForCache(cacheName);
    if (!filename) return;

    const filePath = path.join(this.dataDir, filename);
    
    try {
      let existingData: any = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.trim()) {
          existingData = JSON.parse(fileContent);
        }
      }

      for (const [key, data] of entries) {
        existingData[key] = data;
      }

      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    } catch (error: any) {
      console.error(`Error bulk writing to ${filename}:`, error.message);
    }
  }

  private flushEntry(cacheName: string, key: string, data: any): void {
    this.bulkWrite(cacheName, [[key, data]]);
  }

  private getFilenameForCache(cacheName: string): string | null {
    const mapping: Record<string, string> = {
      'economy': 'economy.json',
      'profiles': 'profiles.json',
      'inventory': 'inventory.json',
      'xp': 'xp.json',
      'daily': 'daily.json',
      'bounties': 'bounties.json',
      'mining': 'mining.json',
      'backgrounds': 'backgrounds.json',
      'punishment': 'punishment.json'
    };
    return mapping[cacheName] || null;
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.log('💾 Flushing caches before shutdown...');
      for (const cacheName of this.caches.keys()) {
        this.syncCache(cacheName);
        const timer = this.syncTimers.get(cacheName);
        if (timer) clearInterval(timer);
      }
      console.log('✅ Caches flushed successfully!');
    };

    process.on('SIGINT', () => {
      shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      shutdown();
      process.exit(0);
    });

    process.on('beforeExit', () => {
      shutdown();
    });
  }

  forceSync(cacheName?: string): void {
    if (cacheName) {
      this.syncCache(cacheName);
    } else {
      for (const name of this.caches.keys()) {
        this.syncCache(name);
      }
    }
  }

  getStats(cacheName: string): { size: number; dirtyCount: number } {
    const cache = this.caches.get(cacheName);
    if (!cache) return { size: 0, dirtyCount: 0 };

    let dirtyCount = 0;
    for (const entry of cache.values()) {
      if (entry.dirty) dirtyCount++;
    }

    return {
      size: cache.size,
      dirtyCount
    };
  }
}

export const cacheManager = new CacheManager();

cacheManager.registerCache('economy', { syncInterval: 15000, ttl: 10 * 60 * 1000 });
cacheManager.registerCache('profiles', { syncInterval: 20000, ttl: 15 * 60 * 1000 });
cacheManager.registerCache('inventory', { syncInterval: 15000, ttl: 10 * 60 * 1000 });
cacheManager.registerCache('xp', { syncInterval: 30000, ttl: 20 * 60 * 1000 });
cacheManager.registerCache('daily', { syncInterval: 60000, ttl: 30 * 60 * 1000 });
cacheManager.registerCache('bounties', { syncInterval: 20000, ttl: 15 * 60 * 1000 });
cacheManager.registerCache('mining', { syncInterval: 20000, ttl: 15 * 60 * 1000 });
cacheManager.registerCache('backgrounds', { syncInterval: 60000, ttl: 60 * 60 * 1000 });
cacheManager.registerCache('punishment', { syncInterval: 30000, ttl: 20 * 60 * 1000 });

console.log('✅ Cache system initialized with auto-sync!');
