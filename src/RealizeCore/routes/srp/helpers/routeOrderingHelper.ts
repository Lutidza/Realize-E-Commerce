/**
 * @file src/RealizeCore/routes/srp/helpers/routeOrderingHelper.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Хелперы сортировки фасетов и проверки каноничности.
 */

import type { SrpRouteFacet } from '../srpRoutes.types'

export const sortFacets = (facets: SrpRouteFacet[]): SrpRouteFacet[] =>
  [...facets].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    }

    return a.alias.localeCompare(b.alias)
  })

export const isCanonicalFacetOrder = (facets: SrpRouteFacet[]): boolean => {
  const sorted = sortFacets(facets)

  if (sorted.length !== facets.length) {
    return false
  }

  for (let index = 0; index < facets.length; index += 1) {
    if (facets[index].alias !== sorted[index].alias) {
      return false
    }
  }

  return true
}
