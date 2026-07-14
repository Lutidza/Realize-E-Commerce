/**
 * @file src/RealizeCore/data/attributes/hooks/syncAttributeSelectionsAfterChange.ts
 * @version 1.0.0 – 2025-02-18 16:25
 * @description Универсальный afterChange-хук для сохранения значений атрибутов.
 */

import type { CollectionAfterChangeHook } from 'payload'

import { saveAttributeValue } from '@/RealizeCore/data/attributes/mutations/saveAttributeValue'
import type { AttributeSelectionsState } from '@/RealizeCore/data/attributes/types'

export type SyncAttributeSelectionsAfterChangeParams = {
  collectionSlug: string
}

/**
 * @remarks Используется коллекциями, где подключено поле attributeSelectionsData.
 * @param params Параметры хука (например, slug коллекции).
 * @returns afterChange-хук, синхронизирующий значения атрибутов.
 */
export const createSyncAttributeSelectionsAfterChange = ({
  collectionSlug,
}: SyncAttributeSelectionsAfterChangeParams) => {
  const hook: CollectionAfterChangeHook = async ({ doc, req }) => {
    const selections = (doc.attributeSelectionsData ?? {}) as AttributeSelectionsState

    if (!doc.id || !selections || Object.keys(selections).length === 0) {
      return doc
    }

    await Promise.all(
      Object.entries(selections).map(([attributeId, selection]) => {
        const numericAttributeId = Number(attributeId)

        if (Number.isNaN(numericAttributeId)) {
          return Promise.resolve()
        }

        return saveAttributeValue(req.payload, {
          collectionSlug,
          docId: doc.id as number,
          attributeId: numericAttributeId,
          valueIds: selection.valueIds ?? [],
          textValue: selection.textValue ?? null,
          boolValue: selection.boolValue ?? null,
        })
      }),
    )

    return doc
  }

  return hook
}

export default createSyncAttributeSelectionsAfterChange
