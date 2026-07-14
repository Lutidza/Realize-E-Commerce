/**
 * @file src/RealizeCore/services/cache/Redis/redisClient.ts
 * @version 0.1.0 – 2026-03-01 23:20
 * @description Ленивое подключение к Redis для кэшей Search API.
 */

import Redis from 'ioredis'

let client: Redis | null = null

const getRedisUrl = () => process.env.REDIS_URL

const getRedisOptions = () => {
  const host = process.env.REDIS_HOST ?? '127.0.0.1'
  const port = Number(process.env.REDIS_PORT ?? 6379)
  const password = process.env.REDIS_PASSWORD

  return {
    host,
    port,
    password,
  }
}

export const isRedisConfigured = () =>
  Boolean(getRedisUrl() || process.env.REDIS_HOST)

export const getRedisClient = () => {
  if (!isRedisConfigured()) {
    return null
  }

  if (!client) {
    try {
      const redisUrl = getRedisUrl()
      client = redisUrl ? new Redis(redisUrl) : new Redis(getRedisOptions())
      client.on('error', (error) => {
        console.error('[redis] connection error', error)
      })
    } catch (error) {
      console.error('[redis] failed to initialize client', error)
      client = null
      return null
    }
  }

  return client
}

export default getRedisClient
