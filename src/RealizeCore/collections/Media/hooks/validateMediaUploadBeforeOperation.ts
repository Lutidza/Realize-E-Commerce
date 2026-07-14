/**
 * @file src/RealizeCore/collections/Media/hooks/validateMediaUploadBeforeOperation.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Payload hook для проверки upload-файла перед записью медиа.
 */

import type { CollectionBeforeOperationHook, PayloadRequest } from 'payload'

import { getResolvedMediaSettings } from '@/RealizeCore/media/services/mediaSettingsService'
import { validateMediaUploadFile } from '@/RealizeCore/media/services/validateMediaUploadFile'

const uploadOperations = new Set(['create', 'update', 'updateByID'])

const resolveUploadFile = ({
  args,
  req,
}: {
  args: unknown
  req: PayloadRequest
}): PayloadRequest['file'] => req.file ?? (args as { file?: PayloadRequest['file'] })?.file

export const validateMediaUploadBeforeOperation: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  const file = resolveUploadFile({ args, req })

  if (!uploadOperations.has(operation) || !file) {
    return args
  }

  const settings = await getResolvedMediaSettings({
    payload: req.payload,
  })

  validateMediaUploadFile({
    file,
    req,
    settings,
  })

  return args
}

export default validateMediaUploadBeforeOperation
