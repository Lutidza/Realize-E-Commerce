/**
 * @file src/RealizeCore/collections/Search/validations/shared.ts
 * @version 0.1.0 – 2026-03-01 22:55
 * @description Общие утилиты и типы для серверной валидации Search Profile.
 */

import type { SearchProfile } from '@/payload-types'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'

export type ValidationIssue = {
  path: string
  message: string
}

export const hasRelationValue = (value: unknown): boolean => {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value).trim().length > 0
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: unknown }).id
    return typeof idValue === 'number' || typeof idValue === 'string'
  }

  return false
}

export const mergeProfileData = (
  incoming?: Partial<SearchProfile> | null,
  original?: SearchProfile | null,
): SearchProfile =>
  ({
    ...(original ?? {}),
    ...(incoming ?? {}),
  }) as SearchProfile
const parseLimit = (envKey: string, fallback: number): number => {
  const raw = process.env[envKey]
  if (typeof raw !== 'string') {
    return fallback
  }

  const numeric = Number(raw)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

export const MAX_CARD_PATH_FACETS = parseLimit(
  'SEARCH_MAX_CARD_PATH_FACETS',
  3,
)
export const MAX_CARD_PATH_VALUE_COUNT = parseLimit(
  'SEARCH_MAX_CARD_PATH_VALUE_COUNT',
  3,
)
