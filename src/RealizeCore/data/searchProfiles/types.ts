/**
 * @file src/RealizeCore/data/searchProfiles/types.ts
 * @version 1.0.0 – 2026-03-02 14:05
 * @description Типы нормализованного Search Profile для фронтенда/поиска.
 */

export type ResolvedFacet = {
  attributeId: number
  key: string
  label: string
  facetFormat: 'value' | 'keyValue'
  urlFormat: 'value' | 'keyValue' | 'range'
  urlOrder: number
  valueSource: 'terms' | 'composite' | 'dictionary'
  countsMode: 'disjunctive' | 'conjunctive' | 'lazy' | 'none'
  isFacetInPath: boolean
  isPinnedFacet: boolean
  showInFilter: boolean
  uiPriority: number
  useInCardPath: boolean
}

export type ResolvedFilterUiSetting = {
  attributeId: number
  key: string
  panel: 'primary' | 'secondary' | 'modal'
  component:
    | 'checkbox-list'
    | 'pills'
    | 'dropdown'
    | 'range-slider'
    | 'searchable-list'
  pinned: boolean
  collapsedByDefault: boolean
  label: string
}

export type ResolvedSortField = {
  field: string
  direction: 'asc' | 'desc'
}

export type ResolvedSort = {
  key: string
  label: string
  fields: ResolvedSortField[]
  attributeId?: number
}

export type ResolvedQueryFilter = {
  key: string
  type: 'keyword' | 'text' | 'numberRange' | 'dateRange' | 'boolean'
  source?: string
  attributeId?: number
  label: string
  defaultValue?: unknown
  uiGroup?: string
  uiComponent?: 'input' | 'range' | 'toggle' | 'select'
  isPinned: boolean
}

export type ResolvedSearchProfile = {
  collectionSlug: string | null
  indexAlias: string | null
  facets: ResolvedFacet[]
  cardPathFacetIds: number[]
  filterUi: ResolvedFilterUiSetting[]
  sorts: ResolvedSort[]
  defaultSort?: ResolvedSort
  queryFilters: ResolvedQueryFilter[]
  limits: {
    maxFacetBuckets: number
    aggCountBudget: number
    bucketCountBudget: number
  }
}

