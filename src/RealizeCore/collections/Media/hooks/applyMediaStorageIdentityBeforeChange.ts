/**
 * @file src/RealizeCore/collections/Media/hooks/applyMediaStorageIdentityBeforeChange.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Payload beforeChange hook для записи storage identity в media document.
 */

import type { CollectionBeforeChangeHook } from 'payload'

import { createMediaStorageIdentity } from '@/RealizeCore/media/services/createMediaStorageIdentity'
import type { Media } from '@/payload-types'

export const applyMediaStorageIdentityBeforeChange: CollectionBeforeChangeHook<Media> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!req.file) {
    return data
  }

  const identity = await createMediaStorageIdentity({
    existingMediaKey: data.mediaKey ?? originalDoc?.mediaKey,
    file: req.file,
    filenameStrategy: data.filenameStrategy ?? originalDoc?.filenameStrategy,
    kind: data.kind ?? originalDoc?.kind,
  })

  return {
    ...data,
    filenameStrategy: identity.filenameStrategy,
    mediaKey: identity.mediaKey,
    originalHash: identity.originalHash,
    safeOriginalFilename: identity.safeOriginalFilename,
  }
}

export default applyMediaStorageIdentityBeforeChange
