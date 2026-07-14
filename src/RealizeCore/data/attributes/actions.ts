/**
 * @file src/RealizeCore/data/attributes/actions.ts
 * @version 1.0.0 – 2025-02-18 12:20
 * @description Серверные действия для загрузки атрибутов и сохранения значений.
 */

'use server'

import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import { getAttributesWithValues } from '@/RealizeCore/data/attributes/queries/getAttributesWithValues'
import { saveAttributeValue } from '@/RealizeCore/data/attributes/mutations/saveAttributeValue'
import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'
import type { SaveAttributeValueParams } from '@/RealizeCore/data/attributes/mutations/saveAttributeValue'

export type FetchAttributesParams = {
  collectionSlug: string
  entityId?: number | string
}

export const fetchAttributesAction = async ({ collectionSlug, entityId }: FetchAttributesParams) => {
  const config = await configPromise
  const payload = await getPayload({ config })

  const normalizedId =
    typeof entityId === 'string'
      ? Number(entityId)
      : typeof entityId === 'number'
        ? entityId
        : undefined

  const docId = normalizedId !== undefined && !Number.isNaN(normalizedId) ? normalizedId : undefined

  return getAttributesWithValues(payload, collectionSlug, docId)
}

export type SaveAttributeValueActionParams = {
  collectionSlug: string
  entityId: number | string
  attributeId: number
  attributeType: AttributeWithValues['type']
  valueIds?: number[]
  textValue?: string | null
  boolValue?: boolean | null
}

export const saveAttributeValueAction = async ({
  collectionSlug,
  entityId,
  attributeId,
  attributeType,
  valueIds,
  textValue,
  boolValue,
}: SaveAttributeValueActionParams) => {
  const config = await configPromise
  const payload = await getPayload({ config })

  const normalizedId = typeof entityId === 'string' ? Number(entityId) : typeof entityId === 'number' ? entityId : undefined

  if (normalizedId === undefined || Number.isNaN(normalizedId)) {
    throw new Error('Неверный идентификатор документа для сохранения атрибутов')
  }

  const payloadData: SaveAttributeValueParams = {
    collectionSlug,
    docId: normalizedId,
    attributeId,
    textValue: undefined,
    valueIds: undefined,
    boolValue: undefined,
  }

  if (attributeType === 'text') {
    payloadData.textValue = textValue ?? ''
  } else if (attributeType === 'checkbox' || attributeType === 'boolean') {
    payloadData.boolValue = typeof boolValue === 'boolean' ? boolValue : null
  } else {
    payloadData.valueIds = valueIds
  }

  await saveAttributeValue(payload, payloadData)
}
