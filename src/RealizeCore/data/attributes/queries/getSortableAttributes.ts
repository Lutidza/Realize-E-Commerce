/**
 * @file src/RealizeCore/data/attributes/queries/getSortableAttributes.ts
 * @version 0.1.0 – 2026-02-28 10:30
 * @description Загружает список атрибутов, доступных для сортировки, по слагу коллекции.
 */

import type { Payload } from 'payload'

import { getAttributeGroupForCollection } from './getAttributeGroupForCollection'

export type SortableAttributeRecord = {
  id: number
  name: string
  slug: string
  sortFieldPath?: string | null
  sortDefaultDirection?: 'asc' | 'desc' | null
  sortLabel?: string | null
}

/**
 * @remarks
 * Возвращает только те атрибуты, которые помечены `isSortable=true` и принадлежат группам,
 * связанным с указанной коллекцией.
 *
 * @param payload Payload client.
 * @param collectionSlug Слаг коллекции (listings, companies и т.п.).
 */
export const getSortableAttributes = async (
  payload: Payload,
  collectionSlug: string,
): Promise<SortableAttributeRecord[]> => {
  if (!collectionSlug) {
    return []
  }

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
          isSortable: {
            equals: true,
          },
        },
        {
          state: {
            equals: 'enable',
          },
        },
      ],
    },
  })

  return (response.docs as SortableAttributeRecord[]) ?? []
}

export default getSortableAttributes
