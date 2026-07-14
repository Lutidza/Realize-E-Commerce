/**
 * @file src/RealizeCore/services/search/elasticsearch/helpers/sorting.ts
 * @version 0.1.0 – 2026-03-02 15:30
 * @description Построение сортировок поиска.
 */

import type { estypes } from '@elastic/elasticsearch'

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { NormalizedFilterState } from '@/RealizeCore/services/search/api/types'

export const buildSort = (
  profile: ResolvedSearchProfile | null,
  snapshot: NormalizedFilterState,
) => {
  const sortEntries: estypes.SortCombinations[] = []

  if (snapshot.sort) {
    sortEntries.push({
      [snapshot.sort]: {
        order: 'asc',
      },
    })
  } else if (profile?.defaultSort?.fields?.length) {
    profile.defaultSort.fields.forEach((field) => {
      sortEntries.push({
        [field.field]: {
          order: field.direction,
        },
      })
    })
  }

  return sortEntries.length > 0 ? sortEntries : undefined
}
