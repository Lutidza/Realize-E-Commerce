/**
 * @file src/RealizeCore/media/services/deleteListingMediaByListingId.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Сервис каскадного удаления медиа, принадлежащих удаляемому объявлению.
 */

import type { Payload } from 'payload'
import type { ListingMedia, Media } from '@/payload-types'

import { normalizeId } from '@/RealizeCore/system-libs/data/normalizeId'

const deletableListingMediaKinds: ReadonlySet<Media['kind']> = new Set([
  'listingPhoto',
  'listingCover',
])

export type DeleteListingMediaByListingIdParams = {
  listingId: number
  payload: Payload
}

export type DeleteListingMediaByListingIdResult = {
  listingMediaDeleted: number
  mediaDeleted: number
  mediaSkipped: number
}

const resolveMediaDocument = async (
  payload: Payload,
  media: ListingMedia['media'],
): Promise<Media | null> => {
  if (media && typeof media === 'object') {
    return media
  }

  const mediaId = normalizeId(media)

  if (!mediaId) {
    return null
  }

  return payload.findByID({
    collection: 'media',
    id: mediaId,
    depth: 0,
    overrideAccess: true,
  })
}

const isMediaUsedByAnotherListing = async ({
  listingId,
  mediaId,
  payload,
}: {
  listingId: number
  mediaId: number
  payload: Payload
}) => {
  const result = await payload.find({
    collection: 'listing-media',
    where: {
      media: {
        equals: mediaId,
      },
    },
    depth: 0,
    limit: 25,
    pagination: false,
    overrideAccess: true,
  })

  return result.docs.some((listingMedia) => {
    const relatedListingId = normalizeId(listingMedia.listing)

    return relatedListingId !== listingId
  })
}

/**
 * @param params Payload instance и ID удаляемого объявления.
 * @returns Количество удалённых связей и media-документов.
 */
export const deleteListingMediaByListingId = async ({
  listingId,
  payload,
}: DeleteListingMediaByListingIdParams): Promise<DeleteListingMediaByListingIdResult> => {
  const listingMediaResult = await payload.find({
    collection: 'listing-media',
    where: {
      listing: {
        equals: listingId,
      },
    },
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
  })

  const mediaIdsToDelete = new Set<number>()
  let mediaSkipped = 0

  for (const listingMedia of listingMediaResult.docs) {
    const mediaId = normalizeId(listingMedia.media)
    const media = await resolveMediaDocument(payload, listingMedia.media)

    if (!mediaId || !media || !deletableListingMediaKinds.has(media.kind)) {
      mediaSkipped += 1
      continue
    }

    const isSharedWithAnotherListing = await isMediaUsedByAnotherListing({
      listingId,
      mediaId,
      payload,
    })

    if (isSharedWithAnotherListing) {
      mediaSkipped += 1
      continue
    }

    mediaIdsToDelete.add(mediaId)
  }

  await payload.delete({
    collection: 'listing-media',
    where: {
      listing: {
        equals: listingId,
      },
    },
    overrideAccess: true,
  })

  let mediaDeleted = 0

  for (const mediaId of mediaIdsToDelete) {
    await payload.delete({
      collection: 'media',
      id: mediaId,
      overrideAccess: true,
    })

    mediaDeleted += 1
  }

  return {
    listingMediaDeleted: listingMediaResult.docs.length,
    mediaDeleted,
    mediaSkipped,
  }
}

export default deleteListingMediaByListingId
