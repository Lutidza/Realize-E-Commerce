/**
 * @file src/RealizeCore/data/attributes/mutations/saveAttributeValue.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Сохранение значений атрибута через Payload API с учётом типа поля.
 * Используется серверными экшенами административного интерфейса.
 */

import type { Payload } from 'payload'

export type SaveAttributeValueParams = {
  collectionSlug: string
  docId: number
  attributeId: number
  /**
   * Значения для мультиселектов/селектов.
   */
  valueIds?: number[]
  /**
   * Совместимость с устаревшим контрактом.
   */
  valueId?: number | null
  textValue?: string | null
  boolValue?: boolean | null
}

/**
 * @remarks Перед сохранением полностью очищает существующие связи, чтобы исключить дубликаты.
 * @param payload Экземпляр Payload.
 * @param params Параметры сохранения.
 */
export const saveAttributeValue = async (payload: Payload, params: SaveAttributeValueParams) => {
  const { collectionSlug, docId, attributeId, valueIds, valueId, textValue, boolValue } = params

  await payload.delete({
    collection: 'attribute-values-relationship',
    where: {
      and: [
        { collectionSlug: { equals: collectionSlug } },
        { docId: { equals: docId } },
        { attribute: { equals: attributeId } },
      ],
    },
    overrideAccess: true,
  })

  const normalizedValues = (valueIds ?? (valueId ? [valueId] : [])).filter(
    (currentValueId) => typeof currentValueId === 'number' && !Number.isNaN(currentValueId),
  )

  const hasText = !(textValue === undefined || textValue === null || textValue === '')
  const hasBool = typeof boolValue === 'boolean'

  if (normalizedValues.length === 0 && !hasText && !hasBool) {
    return
  }

  if (normalizedValues.length > 0) {
    await Promise.all(
      normalizedValues.map((valueId) =>
        payload.create({
          collection: 'attribute-values-relationship',
          data: {
            collectionSlug,
            docId,
            attribute: attributeId,
            value: valueId,
          },
          overrideAccess: true,
        }),
      ),
    )

    return
  }

  if (hasText) {
    await payload.create({
      collection: 'attribute-values-relationship',
      data: {
        collectionSlug,
        docId,
        attribute: attributeId,
        textValue: textValue ?? '',
      },
      overrideAccess: true,
    })

    return
  }

  await payload.create({
    collection: 'attribute-values-relationship',
    data: {
      collectionSlug,
      docId,
      attribute: attributeId,
      boolValue: boolValue ?? null,
    },
    overrideAccess: true,
  })
}

export default saveAttributeValue
