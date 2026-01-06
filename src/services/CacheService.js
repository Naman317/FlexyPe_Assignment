const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {

  async set(key, value, ttl = 300) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return; // Redis not available, skip caching
      }

      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, jsonValue);
      } else {
        await redisClient.set(key, jsonValue);
      }
    } catch (error) {
      logger.warn('Error setting cache', { key, error: error.message });
      // Don't throw - caching is optional
    }
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  async get(key) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return null; // Redis not available
      }

      const value = await redisClient.get(key);
      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as string if not JSON
      }
    } catch (error) {
      logger.warn('Error getting cache', { key, error: error.message });
      return null;
    }
  }

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return;
      }

      await redisClient.del(key);
    } catch (error) {
      logger.warn('Error deleting cache', { key, error: error.message });
    }
  }

  /**
   * Delete multiple cache keys by pattern
   * @param {string} pattern - Key pattern (e.g., 'inventory:*')
   */
  async deletePattern(pattern) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return;
      }

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.warn('Error deleting cache pattern', { pattern, error: error.message });
    }
  }

  /**
   * Clear all cache
   */
  async flushAll() {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return;
      }

      await redisClient.flushDb();
      logger.info('Cache flushed');
    } catch (error) {
      logger.warn('Error flushing cache', { error: error.message });
    }
  }

  
  async increment(key, increment = 1) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return null;
      }

      return await redisClient.incrBy(key, increment);
    } catch (error) {
      logger.warn('Error incrementing cache', { key, error: error.message });
      return null;
    }
  }

  async decrement(key, decrement = 1) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return null;
      }

      return await redisClient.decrBy(key, decrement);
    } catch (error) {
      logger.warn('Error decrementing cache', { key, error: error.message });
      return null;
    }
  }

  
  async exists(key) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        return false;
      }

      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.warn('Error checking cache existence', { key, error: error.message });
      return false;
    }
  }
}

module.exports = new CacheService();
