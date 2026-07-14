/**
 * @file src/RealizeCore/services/search/elasticsearch/helpers/index.ts
 * @version 0.1.0 – 2026-03-02 15:30
 * @description Публичные реэкспорты helper-функций ES-провайдера.
 */

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'

export { buildAppliedFilters, facetField } from './filters'
export type { AppliedFilter } from './filters'
export {
  buildFacetAggregations,
  normalizeFacetCounts,
  pickAggregationFacets,
} from './aggregations'
export type { FacetCountBucket } from './aggregations'
export { buildSort } from './sorting'

export const resolveIndexAlias = (profile: ResolvedSearchProfile | null, collection: string) =>
  profile?.indexAlias && profile.indexAlias.length > 0 ? profile.indexAlias : `${collection}_current`
