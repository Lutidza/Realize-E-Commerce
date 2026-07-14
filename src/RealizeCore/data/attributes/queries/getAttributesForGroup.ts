/**
 * @file src/RealizeCore/data/attributes/queries/getAttributesForGroup.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Утилита загрузки атрибутов по списку групп.
 */

import type { Payload } from 'payload'

/**
 * @param payload Экземпляр Payload.
 * @param groupIds Идентификаторы групп атрибутов.
 */
export const getAttributesForGroup = async (
  payload: Payload,
  groupIds: number[],
) => {
  if (!groupIds || groupIds.length === 0) {
    return []
  }

  const attributes = await payload.find({
    collection: 'attributes',
    select: {
      id: true,
      name: true,
      type: true,
    },
    limit: 0,
    where: {
      and: [
        {
          group: {
            in: groupIds,
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

  return attributes.docs.map((attribute) => ({
    id: attribute.id,
    name: attribute.name,
    type: attribute.type,
  }))
}

export default getAttributesForGroup
