/**
 * @file src/RealizeCore/data/attributes/queries/getAttributesWithValues.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Композиция атрибутов с вариантами и выбранными значениями.
 */

import type { Payload } from 'payload'

import { getAttributesForCollection } from './getAttributesForCollection'
import { loadAttributeValues } from './loadAttributeValues'
import { loadSelections } from './loadSelections'
import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

/**
 * @param payload Экземпляр Payload.
 * @param collectionSlug Целевая коллекция.
 * @param docId Идентификатор документа (необязателен).
 * @returns Список атрибутов с опциями и текущими состояниями.
 */
export const getAttributesWithValues = async (
  payload: Payload,
  collectionSlug: string,
  docId?: number,
): Promise<AttributeWithValues[]> => {
  const attributes = await getAttributesForCollection(payload, collectionSlug)



  if (attributes.length === 0) {
    return []
  }

  const attributeIds = attributes.map((attribute) => attribute.id)
  const optionsByAttribute = await loadAttributeValues(payload, attributeIds)
  const selectedValues =
    typeof docId === 'number' ? await loadSelections(payload, collectionSlug, docId) : undefined

  return attributes.map((attribute) => {
    const selection = selectedValues?.[attribute.id]
    const valueIds = selection?.valueIds ?? []
    const attributeType = attribute.type as string
    const isMultiselect = attributeType === 'multiselect'
    const isTextAttribute = attributeType === 'text'
    const isBooleanAttribute = attributeType === 'checkbox' || attributeType === 'boolean'

    return {
      ...attribute,
      name: attribute.name ?? '',
      options: optionsByAttribute[attribute.id] ?? [],
      selectedValueId: isMultiselect ? undefined : valueIds[0] ?? null,
      selectedValueIds: isMultiselect ? valueIds : undefined,
      selectedTextValue: isTextAttribute ? selection?.textValue ?? null : undefined,
      selectedBooleanValue: isBooleanAttribute ? selection?.boolValue ?? null : undefined,
    }
  })
}

export default getAttributesWithValues
