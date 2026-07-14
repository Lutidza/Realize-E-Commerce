/**
 * @file src/RealizeCore/data/attributes/queries/loadSelections.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Хелпер загрузки текущих значений атрибутов.
 */

import type { Payload } from 'payload'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'

export type AttributeSelectionRow = {
  valueIds: number[]
  textValue?: string | null
  boolValue?: boolean | null
}

/**
 * @param payload Экземпляр Payload.
 * @param collectionSlug Слаг коллекции, к которой привязан атрибут.
 * @param docId Идентификатор документа.
 * @returns Сопоставление идентификатора атрибута к выбранным значениям или тексту.
 */
export const loadSelections = async (
  payload: Payload,
  collectionSlug: string,
  docId: number,
): Promise<Partial<Record<number, AttributeSelectionRow>>> => {
  const relations = await payload.find({
    collection: 'attribute-values-relationship',
    select: {
      attribute: true,
      value: true,
      textValue: true,
      boolValue: true,
    },
    where: {
      and: [
        { collectionSlug: { equals: collectionSlug } },
        { docId: { equals: docId } },
      ],
    },
    limit: 0,
  })

  return relations.docs.reduce<Partial<Record<number, AttributeSelectionRow>>>((acc, relation) => {
    const attributeId = resolveRelationId(relation.attribute)

    if (attributeId === null) {
      return acc
    }

    const valueId = resolveRelationId(relation.value ?? null)
    const current = acc[attributeId] ?? { valueIds: [], textValue: null, boolValue: null }

    if (typeof valueId === 'number') {
      current.valueIds.push(valueId)
    }

    if (relation.textValue) {
      current.textValue = relation.textValue
    }

    if (typeof relation.boolValue === 'boolean') {
      current.boolValue = relation.boolValue
    }

    acc[attributeId] = current

    return acc
  }, {})
}

export default loadSelections
