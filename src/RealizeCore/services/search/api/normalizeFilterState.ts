/**
 * @file src/RealizeCore/services/search/api/normalizeFilterState.ts
 * @version 0.1.0 – 2026-03-01 11:45
 * @description Нормализация FilterState, приходящего из клиента.
 */

import type {
  FacetValues,
  FilterStateInput,
  NormalizedFilterState,
} from './types'

const normalizeFacetEntry = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'number' && Number.isFinite(item)) {
          return String(item)
        }
        if (typeof item === 'string') {
          return item.trim()
        }
        return null
      })
      .filter((item): item is string => Boolean(item && item.length > 0))
  }

  if (typeof value === 'object' && value !== null) {
    const maybeValues = (value as { values?: unknown }).values
    if (maybeValues) {
      return normalizeFacetEntry(maybeValues)
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length > 0) {
      return [trimmed]
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [String(value)]
  }

  return []
}

const normalizeFacets = (input?: Record<string, unknown>): FacetValues => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  return Object.entries(input).reduce<FacetValues>((acc, [key, rawValue]) => {
    if (!key || typeof key !== 'string') {
      return acc
    }

    const normalizedValues = normalizeFacetEntry(rawValue)

    if (normalizedValues.length > 0) {
      acc[key] = normalizedValues
    }

    return acc
  }, {})
}

const normalizeGeo = (input?: Record<string, unknown>) => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const resolveString = (value: unknown) =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined

  return {
    cityAlias: resolveString(input.cityAlias),
    districtAlias: resolveString(input.districtAlias),
    subDistrictAlias: resolveString(input.subDistrictAlias),
  }
}

const normalizeQuery = (input?: Record<string, unknown>) => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  return Object.entries(input).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (typeof key !== 'string' || key.length === 0) {
      return acc
    }
    acc[key] = value
    return acc
  }, {})
}

export const normalizeFilterState = (
  input?: FilterStateInput | null,
): NormalizedFilterState => {
  if (!input || typeof input !== 'object') {
    return {
      facets: {},
      query: {},
      geo: {},
    }
  }

  const facets = normalizeFacets(
    'facets' in input ? (input.facets as Record<string, unknown>) : undefined,
  )
  const query = normalizeQuery(
    'query' in input ? (input.query as Record<string, unknown>) : undefined,
  )
  const geo = normalizeGeo(
    'geo' in input ? (input.geo as Record<string, unknown>) : undefined,
  )
  const sort =
    'sort' in input && typeof input.sort === 'string' && input.sort.trim().length > 0
      ? input.sort.trim()
      : undefined

  return {
    facets,
    query,
    geo,
    sort,
  }
}

export default normalizeFilterState
