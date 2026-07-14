/**
 * @file src/RealizeCore/services/search/api/profileSignature.ts
 * @version 0.1.0 – 2026-03-01 11:50
 * @description Хелперы для построения сигнатур профиля/снэпшота.
 */

import { createHash } from 'crypto'

import type { NormalizedFilterState } from './types'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'

export const buildProfileSignature = (
  profile?: ResolvedSearchProfile | null,
): string => {
  if (!profile || !profile.facets) {
    return 'profile:none'
  }

  const parts = profile.facets
    .map(
      (facet) =>
        `${facet.attributeId}:${facet.key}:${facet.urlFormat}:${facet.urlOrder}:${facet.isFacetInPath}:${facet.isPinnedFacet}`,
    )
    .sort()

  return parts.join('|') || 'profile:none'
}

export const buildSnapshotSignature = ({
  collection,
  snapshot,
  page,
  pageSize,
  locale,
  profileSignature,
}: {
  collection: string
  snapshot: NormalizedFilterState
  page: number
  pageSize: number
  locale: string
  profileSignature: string
}): string => {
  const payload = JSON.stringify({
    collection,
    snapshot,
    page,
    pageSize,
    locale,
    profileSignature,
  })

  return createHash('sha256').update(payload).digest('hex')
}
