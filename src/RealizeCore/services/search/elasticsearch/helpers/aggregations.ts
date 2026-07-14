/**
 * @file src/RealizeCore/services/search/elasticsearch/helpers/aggregations.ts
 * @version 0.1.0 – 2026-03-02 15:30
 * @description Подготовка facet-агрегаций и нормализация ответов ES.
 */

import type { estypes } from '@elastic/elasticsearch'

import type { ResolvedFacet } from '@/RealizeCore/data/searchProfiles/types'
import { facetField, type AppliedFilter } from './filters'

const shouldExcludeFacetFilter = (facet: ResolvedFacet) =>
  facet.countsMode === 'disjunctive' || facet.countsMode === undefined

export const pickAggregationFacets = (
  facets: ResolvedFacet[],
  targetKeys?: Set<string>,
) => {
  return facets.filter((facet) => {
    if (facet.countsMode === 'none') {
      return false
    }

    if (targetKeys && targetKeys.size > 0) {
      return targetKeys.has(facet.key)
    }

    return facet.isPinnedFacet
  })
}

export const buildFacetAggregations = ({
  facets,
  appliedFilters,
  targetKeys,
  bucketSize,
}: {
  facets: ResolvedFacet[]
  appliedFilters: AppliedFilter[]
  targetKeys?: Set<string>
  bucketSize: number
}): Record<string, estypes.AggregationsAggregationContainer> | undefined => {
  const targetFacets = pickAggregationFacets(facets, targetKeys)

  if (targetFacets.length === 0) {
    return undefined
  }

  const aggs: Record<string, estypes.AggregationsAggregationContainer> = {}

  targetFacets.forEach((facet) => {
    if (facet.countsMode === 'none') {
      return
    }

    const filtersWithoutFacet = appliedFilters
      .filter((filter) =>
        shouldExcludeFacetFilter(facet) ? filter.facetKey !== facet.key : true,
      )
      .map((filter) => filter.query)

    const filterQuery =
      filtersWithoutFacet.length > 0 ? { bool: { filter: filtersWithoutFacet } } : { match_all: {} }

    aggs[facet.key] = {
      filter: filterQuery,
      aggs: {
        values: {
          terms: {
            field: facetField(facet.key),
            size: bucketSize,
          },
        },
      },
    }
  })

  return aggs
}

export type FacetCountBucket = {
  value: string
  count: number
}

export const normalizeFacetCounts = (
  facets: ResolvedFacet[],
  responseAggregations: estypes.SearchResponse['aggregations'],
  targetKeys?: Set<string>,
): Record<string, FacetCountBucket[]> => {
  if (!facets || !responseAggregations) {
    return {}
  }

  const result: Record<string, FacetCountBucket[]> = {}

  facets.forEach((facet) => {
    if (targetKeys && targetKeys.size > 0 && !targetKeys.has(facet.key)) {
      return
    }

    if (!facet.isPinnedFacet && (!targetKeys || !targetKeys.has(facet.key))) {
      return
    }

    const filterAgg = responseAggregations?.[facet.key] as estypes.AggregationsFilterAggregate | undefined
    const buckets =
      (filterAgg?.values as estypes.AggregationsStringTermsAggregate | undefined)?.buckets ?? []

    result[facet.key] = (buckets as estypes.AggregationsStringTermsBucket[]).map((bucket) => ({
      value: String(bucket.key),
      count: bucket.doc_count ?? 0,
    }))
  })

  return result
}
