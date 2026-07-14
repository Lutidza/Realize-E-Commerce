/**
 * @file src/RealizeCore/data/searchProfiles/helpers/resolveSortConfiguration.ts
 * @version 1.0.1 – 2026-03-02 23:15
 * @description Хелпер для вычисления дефолтных сортировок Search Profile.
 */

import type { SearchProfile } from '@/payload-types'
import type { ResolvedSort } from '../types'

const sortLabels: Record<string, string> = {
  updatedAt: 'Сортировка по обновлению',
  createdAt: 'Сортировка по созданию',
}

const buildSortConfig = (field: string, direction: 'asc' | 'desc'): ResolvedSort => ({
  key: `${field}-${direction}`,
  label: sortLabels[field] ?? field,
  fields: [{ field, direction }],
})

export const resolveDefaultSort = (profile: SearchProfile): ResolvedSort => {
  const sortField = profile.defaultSortField ?? 'updatedAt'
  const sortDirection = (profile.defaultSortDirection ?? 'desc') as 'asc' | 'desc'
  return buildSortConfig(sortField, sortDirection)
}
