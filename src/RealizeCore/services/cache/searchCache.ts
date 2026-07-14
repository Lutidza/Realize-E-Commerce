/**
 * @file src/RealizeCore/services/cache/searchCache.ts
 * @version 0.1.0 – 2026-03-01 23:25
 * @description Кэши для Search API (Redis L2).
 */

import type Redis from 'ioredis'

import { getRedisClient, isRedisConfigured } from './Redis/redisClient'

type CacheEntry<T> = T

type RedisCache = {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}

const parseTtl = (envKey: string, fallback: number) => {
  const raw = process.env[envKey]
  if (!raw) {
    return fallback
  }

  const numeric = Number(raw)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

const createRedisCache = (
  namespace: string,
  defaultTtlSeconds: number,
): RedisCache => {
  const prefix = (key: string) => `${namespace}:${key}`

  const readClient = (): Redis | null => {
    const client = getRedisClient()
    return client
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      if (!isRedisConfigured()) {
        return null
      }

      const client = readClient()
      if (!client) {
        return null
      }

      try {
        const raw = await client.get(prefix(key))
        if (!raw) {
          return null
        }
        return JSON.parse(raw) as CacheEntry<T>
      } catch (error) {
        console.error(`[cache:${namespace}] get error`, error)
        return null
      }
    },
    async set<T>(
      key: string,
      value: T,
      ttlSeconds = defaultTtlSeconds,
    ): Promise<void> {
      if (!isRedisConfigured()) {
        return
      }

      const client = readClient()
      if (!client) {
        return
      }

      try {
        await client.set(prefix(key), JSON.stringify(value), 'EX', ttlSeconds)
      } catch (error) {
        console.error(`[cache:${namespace}] set error`, error)
      }
    },
    async delete(key: string): Promise<void> {
      if (!isRedisConfigured()) {
        return
      }

      const client = readClient()
      if (!client) {
        return
      }

      try {
        await client.del(prefix(key))
      } catch (error) {
        console.error(`[cache:${namespace}] delete error`, error)
      }
    },
  }
}

const SEARCH_CACHE_TTL = parseTtl('SEARCH_CACHE_TTL_SECONDS', 60)
const FILTERS_CACHE_TTL = parseTtl('FILTERS_CACHE_TTL_SECONDS', 15)

export const searchResponseCache = createRedisCache(
  'search-response-cache',
  SEARCH_CACHE_TTL,
)

export const filtersResponseCache = createRedisCache(
  'filters-response-cache',
  FILTERS_CACHE_TTL,
)

export default {
  searchResponseCache,
  filtersResponseCache,
}
