/**
 * @file src/RealizeCore/services/search/jobs/utils/jobStats.ts
 * @version 0.1.0 – 2026-03-01 14:20
 * @description Подсчёт статусов очереди поиска (`payload-jobs`).
 */

import type { Payload, Where } from 'payload'

import { SEARCH_INDEX_QUEUE } from '../constants'

const countJobs = async ({
  payload,
  where,
}: {
  payload: Payload
  where: Where
}): Promise<number> => {
  const result = await payload.find({
    collection: 'payload-jobs',
    where,
    limit: 1,
    depth: 0,
    pagination: true,
  })

  return result.totalDocs ?? result.docs.length
}

const nullCondition = {
  equals: null,
} as const

export type QueueStats = {
  queue: string
  queued: number
  running: number
  failed: number
}

export const getSearchQueueStats = async ({
  payload,
  queue = SEARCH_INDEX_QUEUE,
}: {
  payload: Payload
  queue?: string
}): Promise<QueueStats> => {
  const baseQueueCondition: Where = {
    queue: { equals: queue },
  }

  const queued = await countJobs({
    payload,
    where: {
      and: [
        baseQueueCondition,
        { completedAt: nullCondition },
        { hasError: { equals: false } },
        { processing: { not_equals: true } },
      ],
    },
  })

  const running = await countJobs({
    payload,
    where: {
      and: [
        baseQueueCondition,
        { processing: { equals: true } },
        { hasError: { equals: false } },
        { completedAt: nullCondition },
      ],
    },
  })

  const failed = await countJobs({
    payload,
    where: {
      and: [baseQueueCondition, { hasError: { equals: true } }, { completedAt: nullCondition }],
    },
  })

  return {
    queue,
    queued,
    running,
    failed,
  }
}

export default getSearchQueueStats
