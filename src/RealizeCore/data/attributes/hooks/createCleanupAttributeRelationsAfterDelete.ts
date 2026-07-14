/**
 * @file src/RealizeCore/data/attributes/hooks/createCleanupAttributeRelationsAfterDelete.ts
 * @version 1.0.0 – 2025-02-18 17:05
 * @description afterDelete-хук для очистки связей attribute-values-relationship.
 */

import type { CollectionAfterDeleteHook } from 'payload'

import { normalizeId } from '@/RealizeCore/system-libs/data/normalizeId'

export type CleanupAttributeRelationsHookParams = {
  collectionSlug: string
}

/**
 * @param params Параметры, зависящие от коллекции-владельца атрибутов.
 * @returns afterDelete-хук, удаляющий все связи для удалённого документа.
 */
export const createCleanupAttributeRelationsAfterDelete = ({
  collectionSlug,
}: CleanupAttributeRelationsHookParams) => {
  const hook: CollectionAfterDeleteHook = async ({ id, req }) => {
    const normalized = normalizeId(id)

    if (typeof normalized !== 'number') {
      return
    }

    await req.payload.delete({
      collection: 'attribute-values-relationship',
      where: {
        and: [
          { collectionSlug: { equals: collectionSlug } },
          { docId: { equals: normalized } },
        ],
      },
      overrideAccess: true,
    })
  }

  return hook
}

export default createCleanupAttributeRelationsAfterDelete
