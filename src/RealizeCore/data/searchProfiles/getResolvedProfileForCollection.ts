/**
 * @file src/RealizeCore/data/searchProfiles/getResolvedProfileForCollection.ts
 * @version 0.1.0 – 2026-02-28 10:55
 * @description Загружает опубликованный Search Profile для коллекции и возвращает резолвленный DTO.
 */

import type { Payload } from 'payload'
import type { SearchProfile } from '@/payload-types'

import { resolveSearchProfile } from './resolveSearchProfile'
import type { ResolvedSearchProfile } from './types'

export const getResolvedProfileForCollection = async (
  payload: Payload,
  collectionSlug: string,
): Promise<ResolvedSearchProfile | null> => {
  if (!collectionSlug) {
    return null
  }

  const response = await payload.find({
    collection: 'search-profiles',
    depth: 0,
    limit: 1,
    sort: '-updatedAt',
    where: {
      and: [
        { collectionSlug: { equals: collectionSlug } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const profile = response.docs[0] as SearchProfile | undefined
  if (!profile) {
    return null
  }

  if (profile.resolvedProfile) {
    return profile.resolvedProfile as ResolvedSearchProfile
  }

  return resolveSearchProfile({
    payload,
    profile,
  })
}

export default getResolvedProfileForCollection
