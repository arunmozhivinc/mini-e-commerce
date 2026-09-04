const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;

/**
 * Creates a configured ioredis instance supporting REDIS_URL and TLS (e.g. Upstash)
 */
const createRedisClient = (overrides = {}) => {
  const retryStrategy = (times) => {
    if (times > 10) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    logger.warn(`Redis: retrying connection in ${delay}ms (attempt ${times})`);
    return delay;
  };

  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy,
      ...overrides,
    });
  }

  const options = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    maxRetriesPerRequest: null,
    retryStrategy,
    ...overrides,
  };

  if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
  }
  if (process.env.REDIS_TLS === 'true' || process.env.REDIS_HOST?.includes('upstash.io')) {
    options.tls = {};
  }

  return new Redis(options);
};

const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = createRedisClient();

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error:', err.message);
  });

  return redisClient;
};

/**
 * Get or set a cached value.
 * @param {string} key - Cache key
 * @param {number} ttl - TTL in seconds
 * @param {Function} fetcher - Async function to fetch data on cache miss
 * @returns {Promise<any>}
 */
const cacheGet = async (key, ttl, fetcher) => {
  const client = getRedisClient();
  try {
    const cached = await client.get(key);
    if (cached) {
      logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    logger.debug(`Cache MISS: ${key}`);
    const data = await fetcher();
    if (data !== null && data !== undefined) {
      await client.setex(key, ttl, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    logger.error(`Cache error for key ${key}:`, error.message);
    // Fallback to fetcher on cache error
    return fetcher();
  }
};

/**
 * Invalidate cache keys matching a pattern.
 * @param {string} pattern - Redis key pattern (e.g., 'products:*')
 */
const cacheInvalidate = async (pattern) => {
  const client = getRedisClient();
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      logger.debug(`Cache invalidated: ${keys.length} keys matching '${pattern}'`);
    }
  } catch (error) {
    logger.error(`Cache invalidation error for pattern ${pattern}:`, error.message);
  }
};

module.exports = { createRedisClient, getRedisClient, cacheGet, cacheInvalidate };
