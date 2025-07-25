// Cache client, feel free to replace with your provider of choice. If no Redis configured, the cache will be disabled you don't have to worry about it.

import { redis } from '../clients';

/**
 * Cache TTL in seconds
 */
export const CACHE_TTL = 60 * 1;

/**
 * Get cached value from Redis
 * @param key - The key to get
 * @returns The cached value or null if no Redis configured
 */
export async function getCached(key: string): Promise<string | null> {
  if (!redis) return null; // Skip if no Redis configured
  try {
    console.log('Getting cached value for key:', key);
    return await redis.get(key);
  } catch (err) {
    console.warn('Redis get failed:', err);
    return null;
  }
}

/**
 * Set cached value in Redis
 * @param key - The key to set
 * @param value - The value to set
 * @param ttl - The time to live in seconds (default: 300)
 */
export async function setCached(
  key: string,
  value: string,
  ttl: number = CACHE_TTL
): Promise<void> {
  if (!redis) return; // Skip caching if no Redis configured
  try {
    console.log('Setting cached value for key:', key);
    await redis.setex(key, ttl, value);
  } catch (err) {
    console.warn('Redis set failed:', err);
  }
}
