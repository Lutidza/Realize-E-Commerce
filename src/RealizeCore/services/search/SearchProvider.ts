/**
 * @file src/RealizeCore/services/search/SearchProvider.ts
 * @version 1.0.0 – 2026-03-02 13:15
 * @description Контракты и типы универсального поискового провайдера.
 */

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { NormalizedFilterState } from './api/types'
import type { FacetCountBucket } from '@/RealizeCore/services/search/elasticsearch/helpers'

export type SearchRequestContext = {
  profile: ResolvedSearchProfile | null
  locale: string
}

export type SearchResult = {
  hits: unknown[]
  total: number
  totalPages: number
  pageInfo: {
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    cursor?: string | null
  }
  counts?: Record<string, FacetCountBucket[]>
}

export type SearchRequest = {
  snapshot: NormalizedFilterState
  page: number
  pageSize: number
  context: SearchRequestContext
}

export interface SearchProvider {
  search(params: SearchRequest): Promise<SearchResult>
}
