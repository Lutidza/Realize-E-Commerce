/**
 * @file src/RealizeCore/data/searchProfiles/helpers/mergeFacetAttributes.ts
 * @version 1.0.0 – 2026-03-02 23:20
 * @description Слияние атрибутов и overrides для нормализации фасетов.
 */

import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import type { ResolvedFacet } from '../types'
import type { FacetOverride } from './buildFacetOverrideMap'
import { resolveFacetUrlFormat } from './resolveFacetUrlFormat'

const defaultValueSource: ResolvedFacet['valueSource'] = 'terms'
const defaultCountsMode: ResolvedFacet['countsMode'] = 'disjunctive'

export const mergeFacetAttributes = (
  attributes: FacetAttributeRecord[],
  overrides: Map<number, FacetOverride>,
  facetMap?: Map<number, FacetAttributeRecord>,
): ResolvedFacet[] => {
  const map = facetMap ?? new Map(attributes.map((attribute) => [attribute.id, attribute] as const))
  return Array.from(map.values()).map((attribute) => {
    const override = overrides.get(attribute.id)
    const label = override?.customLabel ?? attribute.name ?? attribute.slug

    const showInFilter =
      typeof override?.showInFilterOverride === 'boolean'
        ? override.showInFilterOverride
        : attribute.showInFilter === true

    const uiPriority =
      typeof override?.uiPriorityOverride === 'number'
        ? override.uiPriorityOverride
        : typeof attribute.orderInFilter === 'number'
        ? attribute.orderInFilter
        : 0

    const urlOrder =
      typeof override?.urlOrderOverride === 'number'
        ? override.urlOrderOverride
        : typeof attribute.facetPriority === 'number'
        ? attribute.facetPriority
        : Number.MAX_SAFE_INTEGER

    return {
      attributeId: attribute.id,
      key: attribute.slug,
      label,
      facetFormat: attribute.facetFormat === 'value' ? 'value' : 'keyValue',
      urlFormat: resolveFacetUrlFormat(attribute, override),
      urlOrder,
      valueSource: override?.valueSource ?? defaultValueSource,
      countsMode: override?.countsMode ?? defaultCountsMode,
      isFacetInPath: override?.isFacetInPath === true,
      isPinnedFacet: override?.isPinnedFacet === true,
      showInFilter,
      uiPriority,
      useInCardPath: override?.useInCardPath === true,
    }
  })
}

export default mergeFacetAttributes
