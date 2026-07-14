/**
 * @file src/RealizeCore/data/searchProfiles/helpers/queryFilters.ts
 * @version 1.1.0 – 2026-03-02 22:55
 * @description Построение query-фильтров Search Profile.
 */

import type { SearchProfile } from '@/payload-types'
import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import type { ResolvedQueryFilter } from '../types'

export const buildQueryFilters = (
  filters: SearchProfile['queryFilters'],
  facetMap: Map<number, FacetAttributeRecord>,
): ResolvedQueryFilter[] => {
  if (!filters) {
    return []
  }

  const resolved: ResolvedQueryFilter[] = []

  filters.forEach((filter) => {
    const attributeId = typeof filter?.attribute === 'number' ? filter.attribute : null
    const attribute = attributeId !== null ? facetMap.get(attributeId) : undefined
    const attributeAlias = (attribute as FacetAttributeRecord & { urlAlias?: Record<string, string> })?.urlAlias
    const attributeSlug = attribute?.slug

    const key =
      filter?.key ??
      attributeAlias?.default ??
      attributeAlias?.[Object.keys(attributeAlias ?? {})[0] as string] ??
      attributeSlug ??
      (attributeId !== null ? String(attributeId) : undefined)

    if (!key || !filter?.type) {
      return
    }

    resolved.push({
      key,
      type: filter.type as ResolvedQueryFilter['type'],
      source: filter.source ?? attribute?.slug,
      attributeId: attributeId ?? undefined,
      label: filter.customLabel ?? attribute?.name ?? key,
      defaultValue: filter.defaultValue,
      uiGroup: filter.uiGroup ?? undefined,
      uiComponent: filter.uiComponent as ResolvedQueryFilter['uiComponent'],
      isPinned: filter.isPinned === true,
    })
  })

  return resolved
}

export default buildQueryFilters
