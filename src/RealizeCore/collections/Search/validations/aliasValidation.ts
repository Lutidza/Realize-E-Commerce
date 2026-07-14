/**
 * @file src/RealizeCore/collections/Search/validations/aliasValidation.ts
 * @version 0.1.0 – 2026-03-01 22:55
 * @description Smoke-check alias в Elasticsearch перед публикацией профиля.
 */

import type { SearchProfile } from '@/payload-types'
import {
  getElasticsearchClient,
  isElasticsearchConfigured,
} from '@/RealizeCore/services/search/elasticsearch/client'
import type { ValidationIssue } from './shared'

export const validateIndexAlias = async (
  profile: SearchProfile,
): Promise<ValidationIssue | null> => {
  const alias =
    typeof profile.indexAlias === 'string'
      ? profile.indexAlias.trim()
      : ''

  if (!alias) {
    return {
      path: 'indexAlias',
      message: 'Укажите alias индекса.',
    }
  }

  if (!isElasticsearchConfigured()) {
    return null
  }

  try {
    const client = getElasticsearchClient()
    const existsResponse = await client.indices.existsAlias({ name: alias })
    const aliasExists =
      typeof existsResponse === 'boolean'
        ? existsResponse
        : Boolean(
            (existsResponse as { body?: boolean; statusCode?: number }).body,
          )

    if (!aliasExists) {
      return {
        path: 'indexAlias',
        message: `Alias "${alias}" не найден в Elasticsearch.`,
      }
    }
  } catch (error) {
    return {
      path: 'indexAlias',
      message: `Не удалось проверить alias "${alias}": ${
        error instanceof Error ? error.message : 'unknown error'
      }.`,
    }
  }

  return null
}

