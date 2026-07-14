/**
 * @file src/RealizeCore/data/attributes/queries/getAttributeGroupForCollection.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Определяет группы атрибутов по слагу коллекции.
 */

import type { Payload } from 'payload'

/**
 * @param payload Экземпляр Payload.
 * @param collectionSlug Слаг коллекции.
 */
export const getAttributeGroupForCollection = async (
  payload: Payload,
  collectionSlug: string,
) => {
  if (!collectionSlug) {
    return []
  }

  const result = await payload.find({
    collection: 'attributes-groups',
    select: {
      id: true,
      name: true,
      slug: true,
      'related-collections': true,
    },
    where: {
      and: [
        {
          'related-collections': {
            equals: collectionSlug,
          },
        },
        {
          state: {
            equals: 'enable',
          },
        },
      ],
    },
    limit: 0,
  })

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[AttributesField] groups for collection', collectionSlug, result.docs)
  }

  return result.docs.map(({ id, name, slug }) => ({
    id,
    name,
    slug,
  }))
}

export default getAttributeGroupForCollection
