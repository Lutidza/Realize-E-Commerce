/**
 * @file src/RealizeCore/services/search/elasticsearch/client.ts
 * @version 0.1.0 – 2026-03-01 12:25
 * @description Ленивое создание клиента Elasticsearch.
 */

import { Client } from '@elastic/elasticsearch'

let client: Client | null = null

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.toLowerCase()

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false
  }

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true
  }

  return fallback
}

export const getElasticsearchClient = () => {
  if (client) {
    return client
  }

  const node = process.env.ELASTICSEARCH_NODE

  if (!node) {
    throw new Error('ELASTICSEARCH_NODE is not configured')
  }

  client = new Client({
    node,
    auth:
      process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
        ? {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD,
          }
        : undefined,
    tls: {
      rejectUnauthorized: parseBoolean(
        process.env.ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED,
        true,
      ),
    },
  })

  return client
}

export const isElasticsearchConfigured = () =>
  typeof process.env.ELASTICSEARCH_NODE === 'string' &&
  process.env.ELASTICSEARCH_NODE.length > 0

export default getElasticsearchClient
