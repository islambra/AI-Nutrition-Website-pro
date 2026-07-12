const cache = new Map();

function createCache(ttlMs = 60000) {
  return {
    get(key) {
      const entry = cache.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key, value, customTtl) {
      cache.set(key, {
        value,
        expiry: Date.now() + (customTtl || ttlMs)
      });
    },
    invalidate(key) {
      cache.delete(key);
    },
    invalidatePrefix(prefix) {
      for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
      }
    },
    clear() {
      cache.clear();
    }
  };
}

const defaultCache = createCache(60000);

export function cacheMiddleware(ttlMs = 60000) {
  const store = createCache(ttlMs);
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = `__cache__${req.originalUrl}`;
    const cached = store.get(key);
    if (cached) {
      return res.json(cached);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, body, ttlMs);
      }
      return originalJson(body);
    };
    next();
  };
}

export { createCache, defaultCache };
