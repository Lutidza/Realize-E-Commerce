/**
 * @file src/RealizeCore/services/search/elasticsearch/ElasticsearchSearchProvider.ts
 * @version 0.1.0 – 2026-03-02 15:35
 * @description Класс SearchProvider для Elasticsearch (hits + counts).
 */

import { errors } from '@elastic/elasticsearch'
import type { estypes } from '@elastic/elasticsearch'

import type {
  SearchProvider as SearchProviderContract,
  SearchRequest,
  SearchResult,
} from '@/RealizeCore/services/search/SearchProvider'
import { getElasticsearchClient } from '@/RealizeCore/services/search/elasticsearch/client'
import {
  buildAppliedFilters,
  buildFacetAggregations,
  buildSort,
  normalizeFacetCounts,
  pickAggregationFacets,
  resolveIndexAlias,
} from '@/RealizeCore/services/search/elasticsearch/helpers'
import { enforceFacetAggregationBudget } from '@/RealizeCore/services/search/api/budget'

export class ElasticsearchSearchProvider implements SearchProviderContract {
  constructor(private readonly collection: 'listings' | 'companies') {}

  async search({ snapshot, page, pageSize, context }: SearchRequest): Promise<SearchResult> {
    const profile = context.profile

    if (!profile) {
      throw new Error('Search profile is required for Elasticsearch provider')
    }

    const appliedFilters = buildAppliedFilters(snapshot, profile)
    const queryFilters = appliedFilters.map((filter) => filter.query)

    const query: estypes.QueryDslQueryContainer =
      queryFilters.length > 0 ? { bool: { filter: queryFilters } } : { match_all: {} }

    const client = getElasticsearchClient()
    const indexAlias = resolveIndexAlias(profile, this.collection)
    const from = Math.max(0, (page - 1) * pageSize)

    const targetFacets = pickAggregationFacets(profile.facets ?? [])
    const bucketSize = enforceFacetAggregationBudget({
      profile,
      targetCount: targetFacets.length,
    })

    const aggs = buildFacetAggregations({
      facets: profile.facets ?? [],
      appliedFilters,
      bucketSize,
    })
    const sort = buildSort(profile, snapshot)

    const executeSearch = async (params: {
      sort?: estypes.Sort | estypes.SortCombinations[]
    }) => {
      return client.search({
        index: indexAlias,
        from,
        size: pageSize,
        track_total_hits: true,
        query,
        sort: params.sort,
        aggs,
      })
    }

    let response: Awaited<ReturnType<typeof executeSearch>>

    try {
      response = await executeSearch({ sort })
    } catch (error) {
      if (
        sort &&
        error instanceof errors.ResponseError &&
        error.message.includes('No mapping found for')
      ) {
        response = await executeSearch({ sort: undefined })
      } else {
        throw error
      }
    }

    const hitDocs =
      response.hits.hits?.map((hit) => ({
        id: hit._id,
        ...(hit._source ?? {}),
      })) ?? []

    const totalHits =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? hitDocs.length

    const totalPages = Math.max(1, Math.ceil(totalHits / pageSize))
    const counts = normalizeFacetCounts(profile.facets ?? [], response.aggregations)

    return {
      hits: hitDocs,
      total: totalHits,
      totalPages,
      pageInfo: {
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        cursor: null,
      },
      counts,
    }
  }
}

export default ElasticsearchSearchProvider
