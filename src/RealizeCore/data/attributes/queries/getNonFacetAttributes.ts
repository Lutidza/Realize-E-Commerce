/**
 * @file src/RealizeCore/data/attributes/queries/getNonFacetAttributes.ts
 * @version 1.0.0 – 2025-02-19 10:00
 * @description Загрузка атрибутов без isFacet для построения фильтров.
 */

import type { Payload } from 'payload'

export type NonFacetAttribute = {
  id: number
  name: string
  slug: string
  urlAlias?: Record<string, string>
  orderInFilter?: number | null
  values?: Array<{ id: number; name: string; slug?: string; urlAlias?: Record<string, string> }>
}

export const getNonFacetAttributes = async (payload: Payload): Promise<NonFacetAttribute[]> => {
  const response = await payload.find({
    collection: 'attributes',
    depth: 0,
    limit: 0,
    where: {
      isFacet: {
        equals: false,
      },
      showInFilter: {
        equals: true,
      },
    },
  })

  return (response.docs as unknown as NonFacetAttribute[]) ?? []
}

export default getNonFacetAttributes
