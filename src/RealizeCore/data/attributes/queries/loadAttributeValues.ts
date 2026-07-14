/**
 * @file src/RealizeCore/data/attributes/queries/loadAttributeValues.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Загрузка вариантов значений атрибутов.
 */

import type { Payload } from 'payload'

import type { AttributeOption } from '@/RealizeCore/data/attributes/types'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'

/**
 * @param payload Экземпляр Payload.
 * @param attributeIds Список идентификаторов атрибутов.
 * @returns Сопоставление атрибутов к их вариантам.
 */
export const loadAttributeValues = async (
  payload: Payload,
  attributeIds: number[],
): Promise<Partial<Record<number, AttributeOption[]>>> => {
  if (attributeIds.length === 0) {
    return {}
  }

  const attributeValues = await payload.find({
    collection: 'attribute-values',
    select: {
      id: true,
      name: true,
      attribute: true,
      isDefault: true,
    },
    where: {
      attribute: {
        in: attributeIds,
      },
    },
    limit: 0,
  })

  const result = attributeValues.docs.reduce<Partial<Record<number, AttributeOption[]>>>((acc, value) => {
    const attributeId = resolveRelationId(value.attribute)

    if (attributeId === null) {
      return acc
    }

    const nextOptions = acc[attributeId] ?? []
    const isDefaultFlag = (value as Partial<{ isDefault: boolean }>).isDefault ?? false
    nextOptions.push({
      id: value.id,
      name: value.name,
      isDefault: isDefaultFlag,
    })
    acc[attributeId] = nextOptions

    return acc
  }, {})

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[AttributesField] attribute values map', result)
  }

  return result
}

export default loadAttributeValues
