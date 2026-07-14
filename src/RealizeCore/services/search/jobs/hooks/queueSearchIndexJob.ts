/**
 * @file src/RealizeCore/services/search/jobs/hooks/queueSearchIndexJob.ts
 * @version 0.1.0 – 2026-03-01 13:50
 * @description Хуки для постановки задач синхронизации в очередь.
 */

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import {
  SEARCH_INDEX_QUEUE,
  DELETE_OPERATION,
  INDEX_OPERATION,
  type SearchIndexOperation,
  type SearchIndexTaskSlug,
} from '../constants'

const toNumericId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }

  return null
}

const enqueueJob = async ({
  req,
  taskSlug,
  documentId,
  operation,
}: {
  req: Parameters<CollectionAfterChangeHook>[0]['req']
  taskSlug: SearchIndexTaskSlug
  documentId: number
  operation: SearchIndexOperation
}) => {
  if (!req?.payload?.jobs?.queue) {
    req?.payload?.logger?.warn?.(
      '[search:index] jobs queue API is not available; skipping sync task',
    )
    return
  }

  try {
    await req.payload.jobs.queue({
      task: taskSlug,
      input: {
        documentId,
        operation,
      },
      queue: SEARCH_INDEX_QUEUE,
    })
  } catch (error) {
    req?.payload?.logger?.error?.(
      { error, documentId, taskSlug, operation },
      '[search:index] Failed to queue job',
    )
  }
}

export const createQueueSearchIndexAfterChangeHook = (
  taskSlug: SearchIndexTaskSlug,
): CollectionAfterChangeHook => {
  return async ({ req, doc }) => {
    const documentId = toNumericId(doc?.id)

    if (!documentId) {
      return
    }

    await enqueueJob({
      req,
      taskSlug,
      documentId,
      operation: INDEX_OPERATION,
    })
  }
}

export const createQueueSearchIndexAfterDeleteHook = (
  taskSlug: SearchIndexTaskSlug,
): CollectionAfterDeleteHook => {
  return async ({ req, doc }) => {
    const documentId = toNumericId(doc?.id)

    if (!documentId) {
      return
    }

    await enqueueJob({
      req,
      taskSlug,
      documentId,
      operation: DELETE_OPERATION,
    })
  }
}
