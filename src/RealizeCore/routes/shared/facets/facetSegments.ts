/**
 * @file src/RealizeCore/routes/shared/facets/facetSegments.ts
 * @version 1.0.0 – 2025-12-05 14:45
 * @description Общие утилиты для разбора сегментов фасетов в URL.
 */

import type { FacetDictionary } from './facetDictionaryTypes'

export type ParsedFacetSegment = {
  key: string
  value: string
  valueId: number
  valueLabel: string
  attributeId: number
  alias: string
  order: number
}

export const extractFacetSegments = (
  segments: string[],
  dictionary: FacetDictionary,
): { facets: ParsedFacetSegment[]; rest: string[] } => {
  const facets: ParsedFacetSegment[] = []
  let index = 0

  while (index < segments.length) {
    const alias = segments[index]
    const entry = dictionary.byAlias[alias]

    if (!entry) {
      break
    }

    facets.push({
      key: entry.key,
      value: entry.value,
      valueId: entry.valueId,
      valueLabel: entry.valueLabel,
      attributeId: entry.attributeId,
      alias: entry.alias,
      order: entry.urlOrder,
    })
    index += 1
  }

  return {
    facets,
    rest: segments.slice(index),
  }
}

export default extractFacetSegments
