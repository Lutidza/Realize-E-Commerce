/**
 * @file src/RealizeCore/data/attributes/queries/getAttributesForCollection.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Базовый набор атрибутов по коллекции.
 */

import type { Payload } from 'payload'

import { getAttributeGroupForCollection } from './getAttributeGroupForCollection'
import { getAttributesForGroup } from './getAttributesForGroup'

/**
 * @param payload Экземпляр Payload.
 * @param collectionSlug Слаг коллекции.
 */
export const getAttributesForCollection = async (payload: Payload, collectionSlug: string) => {
  if (!collectionSlug) {
    return []
  }

  const attributeGroups = await getAttributeGroupForCollection(payload, collectionSlug)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[AttributesField] attribute groups length', attributeGroups.length)
  }
  const groupIds = attributeGroups.map((group) => group.id)

  if (groupIds.length === 0) {
    return []
  }

  const attributes = await getAttributesForGroup(payload, groupIds)

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[AttributesField] attributes found', attributes.length)
  }

  return attributes
}

export default getAttributesForCollection
