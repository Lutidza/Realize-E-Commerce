/**
 * @file src/RealizeCore/data/attributes/queries/getFacetAttributes.ts
 * @version 1.0.0 – 2025-02-19 00:45
 * @description Загрузка конфигурации фасетных атрибутов для SEO-URL.
 */

import type { Payload } from 'payload'

import { getAttributeGroupForCollection } from './getAttributeGroupForCollection'

export type FacetAttributeRecord = {
  id: number
  name: string
  slug: string
  urlAlias?: Record<string, string>
  facetPriority?: number | null
  facetFormat?: 'value' | 'keyValue' | null
  showInFilter?: boolean | null
  orderInFilter?: number | null
  values: Array<{ id: number; name: string; slug?: string; urlAlias?: Record<string, string> }>
}

export const getFacetAttributes = async (payload: Payload, collectionSlug: string) => {
  const groups = await getAttributeGroupForCollection(payload, collectionSlug)
  const groupIds = groups.map((group) => group.id)

  if (groupIds.length === 0) {
    return []
  }

  const response = await payload.find({
    collection: 'attributes',
    depth: 0,
    limit: 0,
    where: {
      and: [
        {
          group: {
            in: groupIds,
          },
        },
        {
          isFacet: {
            equals: true,
          },
        },
      ],
    },
  })

  return (response.docs as unknown as FacetAttributeRecord[]) ?? []
}

export default getFacetAttributes
