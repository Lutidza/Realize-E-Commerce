/**
 * @file src/RealizeCore/config/searchProfileValidation.ts
 * @version 0.1.0 – 2026-03-01 22:20
 * @description Настройки валидации Search Profile (лимиты и allow-list полей).
 */

const parseNumberEnv = (key: string, fallback: number): number => {
  const raw = process.env[key]
  if (typeof raw !== 'string') {
    return fallback
  }

  const numeric = Number(raw)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

const parseListEnv = (key: string, fallback: string[]): string[] => {
  const raw = process.env[key]
  if (typeof raw !== 'string') {
    return fallback
  }

  const entries = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  return entries.length > 0 ? Array.from(new Set(entries)) : fallback
}

const DEFAULT_SORT_FIELDS = ['updatedAt', 'createdAt', 'id']

export const searchProfileValidationConfig = {
  allowedCustomSortFields: parseListEnv(
    'SEARCH_ALLOWED_SORT_FIELDS',
    DEFAULT_SORT_FIELDS,
  ),
  allowedAdditionalSortFields: parseListEnv(
    'SEARCH_ALLOWED_ADDITIONAL_SORT_FIELDS',
    DEFAULT_SORT_FIELDS,
  ),
  maxAdditionalSortFields: parseNumberEnv(
    'SEARCH_SORT_ADDITIONAL_FIELDS_LIMIT',
    3,
  ),
  allowedQuerySourcePrefixes: parseListEnv(
    'SEARCH_ALLOWED_QUERY_SOURCE_PREFIXES',
    ['facets.', 'attributes.', 'geo.'],
  ),
  complexityLimits: {
    pinnedFacetCount: parseNumberEnv('SEARCH_MAX_PINNED_FACETS', 8),
    disjunctiveFacetCount: parseNumberEnv(
      'SEARCH_MAX_DISJUNCTIVE_FACETS',
      8,
    ),
    highCardinalityFacetCount: parseNumberEnv(
      'SEARCH_MAX_HIGH_CARDINALITY_FACETS',
      4,
    ),
    aggCountBudget: parseNumberEnv('SEARCH_MAX_AGG_BUDGET', 6000),
    bucketCountBudget: parseNumberEnv('SEARCH_MAX_BUCKET_BUDGET', 1500),
  },
}

export default searchProfileValidationConfig
