/**
 * @file src/RealizeCore/services/search/elasticsearch/helpers/filters.ts
 * @version 0.1.0 – 2026-03-02 15:30
 * @description Конструкторы ES-фильтров для SearchProvider.
 */

import type { estypes } from '@elastic/elasticsearch'

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { NormalizedFilterState } from '@/RealizeCore/services/search/api/types'

export type AppliedFilter = {
  facetKey?: string
  query: estypes.QueryDslQueryContainer
}

export const facetField = (key: string) => `facets.${key}.keyword`

const buildFacetFilters = (snapshot: NormalizedFilterState): AppliedFilter[] => {
  return Object.entries(snapshot.facets ?? {}).map(([key, values]) => ({
    facetKey: key,
    query: {
      terms: {
        [facetField(key)]: values,
      },
    },
  }))
}

const buildKeywordValues = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => {
        if (typeof value === 'string') {
          return value.trim()
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
          return String(value)
        }
        return null
      })
      .filter((value): value is string => Boolean(value && value.length > 0))
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return [raw.trim()]
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return [String(raw)]
  }

  return []
}

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no'].includes(normalized)) {
      return false
    }
  }

  return undefined
}

const buildRangeQuery = (
  field: string,
  value: unknown,
): estypes.QueryDslQueryContainer | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const fromValue =
    (value as { from?: unknown }).from ?? (value as { min?: unknown }).min
  const toValue =
    (value as { to?: unknown }).to ?? (value as { max?: unknown }).max

  const range: estypes.QueryDslRangeQuery = {}

  if (typeof fromValue === 'number' && Number.isFinite(fromValue)) {
    range.gte = fromValue
  } else if (typeof fromValue === 'string' && fromValue.trim().length > 0) {
    const numeric = Number(fromValue)
    range.gte = Number.isFinite(numeric) ? numeric : fromValue
  }

  if (typeof toValue === 'number' && Number.isFinite(toValue)) {
    range.lte = toValue
  } else if (typeof toValue === 'string' && toValue.trim().length > 0) {
    const numeric = Number(toValue)
    range.lte = Number.isFinite(numeric) ? numeric : toValue
  }

  if (range.gte === undefined && range.lte === undefined) {
    return null
  }

  return {
    range: {
      [field]: range,
    },
  }
}

const buildQueryFilterQueries = (
  snapshot: NormalizedFilterState,
  profile: ResolvedSearchProfile | null,
): AppliedFilter[] => {
  if (!profile?.queryFilters || profile.queryFilters.length === 0) {
    return []
  }

  const filters: AppliedFilter[] = []

  profile.queryFilters.forEach((filter) => {
    const rawValue = snapshot.query?.[filter.key]

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return
    }

    const field = filter.source ?? facetField(filter.key)

    switch (filter.type) {
      case 'keyword': {
        const values = buildKeywordValues(rawValue)
        if (values.length === 0) {
          return
        }
        filters.push({
          query:
            values.length === 1
              ? { term: { [field]: values[0] } }
              : { terms: { [field]: values } },
        })
        break
      }
      case 'text': {
        if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
          return
        }
        filters.push({
          query: {
            match: {
              [field]: {
                query: rawValue.trim(),
                operator: 'and',
              },
            },
          },
        })
        break
      }
      case 'numberRange':
      case 'dateRange': {
        const rangeQuery = buildRangeQuery(field, rawValue)
        if (rangeQuery) {
          filters.push({ query: rangeQuery })
        }
        break
      }
      case 'boolean': {
        const boolValue = normalizeBoolean(rawValue)
        if (typeof boolValue === 'boolean') {
          filters.push({
            query: {
              term: {
                [field]: boolValue,
              },
            },
          })
        }
        break
      }
      default:
        break
    }
  })

  return filters
}

const buildGeoFilters = (snapshot: NormalizedFilterState): AppliedFilter[] => {
  const filters: AppliedFilter[] = []

  if (snapshot.geo?.cityAlias) {
    filters.push({
      query: {
        term: {
          cityAlias: snapshot.geo.cityAlias,
        },
      },
    })
  }

  return filters
}

export const buildAppliedFilters = (
  snapshot: NormalizedFilterState,
  profile: ResolvedSearchProfile | null,
) => {
  const filters: AppliedFilter[] = []
  filters.push(...buildFacetFilters(snapshot))
  filters.push(...buildQueryFilterQueries(snapshot, profile))
  filters.push(...buildGeoFilters(snapshot))

  return filters
}
