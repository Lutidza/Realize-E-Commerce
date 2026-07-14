/**
 * @file src/RealizeCore/srp/srpFacetDictionary.ts
 * @description Группировка словаря фасетов по attributeId.
 */

import type { FacetAliasEntry, FacetDictionary } from '@/RealizeCore/routes/shared/facets'

export const groupFacetDictionaryByAttribute = (
  dictionary: FacetDictionary,
): Map<number, FacetAliasEntry[]> => {
  const map = new Map<number, FacetAliasEntry[]>()

  Object.values(dictionary.byValueId).forEach((entry) => {
    const bucket = map.get(entry.attributeId) ?? []
    bucket.push(entry)
    map.set(entry.attributeId, bucket)
  })

  return map
}
