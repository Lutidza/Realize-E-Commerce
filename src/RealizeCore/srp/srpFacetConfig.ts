/**
 * @file src/RealizeCore/srp/srpFacetConfig.ts
 * @description Хелперы построения карт конфигурации фасетов Search Profile.
 */

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'

export const buildFacetConfigMap = (
  profile?: ResolvedSearchProfile | null,
): Map<number, ResolvedSearchProfile['facets'][number]> => {
  const map = new Map<number, ResolvedSearchProfile['facets'][number]>()
  profile?.facets?.forEach((facet) => {
    map.set(facet.attributeId, facet)
  })
  return map
}
