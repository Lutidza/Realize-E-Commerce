/**
 * @file src/RealizeCore/services/search/api/types.ts
 * @version 0.1.0 – 2026-03-01 11:40
 * @description Типы и интерфейсы для Search API (FilterState, Snapshot и пр.).
 */

export type FacetValues = Record<string, string[]>

export type NormalizedFilterState = {
  facets: FacetValues
  query: Record<string, unknown>
  sort?: string
  geo: {
    cityAlias?: string
    districtAlias?: string
    subDistrictAlias?: string
  }
}

export type FilterStateInput =
  | NormalizedFilterState
  | {
      facets?: Record<string, unknown>
      query?: Record<string, unknown>
      sort?: unknown
      geo?: Record<string, unknown>
    }

export type SearchRequestInclude = {
  hits?: boolean
  counts?: boolean
  ranges?: boolean
}

export type SearchRequestBody = {
  collection: string
  snapshot?: FilterStateInput | null
  page?: number
  pageSize?: number
  locale?: string
  include?: SearchRequestInclude
}

export type FiltersRequestBody = {
  collection: string
  snapshot?: FilterStateInput | null
  facetKeys?: string[]
  locale?: string
}
