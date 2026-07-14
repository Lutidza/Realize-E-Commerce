/**
 * @file src/RealizeCore/collections/Listings/hooks/createDeleteListingMediaAfterDelete.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description afterDelete-хук для удаления медиа, принадлежащих удалённому объявлению.
 */

import type { CollectionAfterDeleteHook } from 'payload'

import { deleteListingMediaByListingId } from '@/RealizeCore/media/services/deleteListingMediaByListingId'
import { normalizeId } from '@/RealizeCore/system-libs/data/normalizeId'

export const createDeleteListingMediaAfterDelete = (): CollectionAfterDeleteHook => {
  return async ({ doc, id, req }) => {
    const listingId = normalizeId(doc?.id ?? id)

    if (!listingId) {
      return
    }

    await deleteListingMediaByListingId({
      listingId,
      payload: req.payload,
    })
  }
}

export default createDeleteListingMediaAfterDelete
