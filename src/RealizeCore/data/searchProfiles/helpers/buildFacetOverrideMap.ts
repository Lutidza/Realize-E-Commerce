/**
 * @file src/RealizeCore/data/searchProfiles/helpers/buildFacetOverrideMap.ts
 * @version 1.0.0 – 2026-03-02 23:20
 * @description Вспомогательная функция для построения карты facet overrides.
 */

import type { SearchProfile } from '@/payload-types'

export type FacetOverride = NonNullable<SearchProfile['facetOverrides']>[number]

export const buildFacetOverrideMap = (overrides?: SearchProfile['facetOverrides']) => {
  const map = new Map<number, FacetOverride>()

  overrides?.forEach((override) => {
    const attributeId = typeof override?.attribute === 'number' ? override.attribute : null

    if (attributeId !== null) {
      map.set(attributeId, override)
    }
  })

  return map
}

export default buildFacetOverrideMap
