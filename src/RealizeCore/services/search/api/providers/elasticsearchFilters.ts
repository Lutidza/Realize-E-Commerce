/**
 * @file src/RealizeCore/services/search/api/providers/elasticsearchFilters.ts
 * @version 0.1.0 – 2026-03-01 16:05
 * @description Получение counts по выбранным фасетам (lazy секции).
 */

import type { estypes } from '@elastic/elasticsearch'

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { NormalizedFilterState } from '@/RealizeCore/services/search/api/types'
import { getElasticsearchClient } from '@/RealizeCore/services/search/elasticsearch/client'
import {
  buildAppliedFilters,
  buildFacetAggregations,
  normalizeFacetCounts,
  pickAggregationFacets,
  resolveIndexAlias,
} from '@/RealizeCore/services/search/elasticsearch/helpers'
import { enforceFacetAggregationBudget } from '@/RealizeCore/services/search/api/budget'

export const fetchFacetCounts = async ({
  collection,
  profile,
  snapshot,
  facetKeys,
}: {
  collection: 'listings' | 'companies'
  profile: ResolvedSearchProfile | null
  snapshot: NormalizedFilterState
  facetKeys: string[]
}) => {
  if (!profile || facetKeys.length === 0) {
    return {}
  }

  const targetKeys = new Set(facetKeys)
  const appliedFilters = buildAppliedFilters(snapshot, profile)
  const queryFilters = appliedFilters.map((filter) => filter.query)

  const query: estypes.QueryDslQueryContainer =
    queryFilters.length > 0 ? { bool: { filter: queryFilters } } : { match_all: {} }

  const targetFacets = pickAggregationFacets(profile.facets ?? [], targetKeys)
  const bucketSize = enforceFacetAggregationBudget({
    profile,
    targetCount: targetFacets.length,
  })

  const aggs = buildFacetAggregations({
    facets: profile.facets ?? [],
    appliedFilters,
    targetKeys,
    bucketSize,
  })

  if (!aggs) {
    return {}
  }

  const client = getElasticsearchClient()
  const indexAlias = resolveIndexAlias(profile, collection)

  const response = await client.search({
    index: indexAlias,
    size: 0,
    track_total_hits: false,
    query,
    aggs,
  })

  return normalizeFacetCounts(profile.facets ?? [], response.aggregations, targetKeys)
}

export default fetchFacetCounts
