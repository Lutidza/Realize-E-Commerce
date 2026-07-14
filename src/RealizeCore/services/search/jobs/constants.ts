/**
 * @file src/RealizeCore/services/search/jobs/constants.ts
 * @version 0.1.0 – 2026-03-01 13:35
 * @description Общие константы для job queue поиска.
 */

import type { Config } from '@/payload-types'

export const SEARCH_INDEX_QUEUE = 'search-indexing'

export const INDEX_OPERATION = 'index'
export const DELETE_OPERATION = 'delete'

export type SearchIndexTaskSlug = Extract<
  keyof Config['jobs']['tasks'],
  'syncListingSearchDocument' | 'syncCompanySearchDocument'
>

export type SearchIndexOperation = typeof INDEX_OPERATION | typeof DELETE_OPERATION
