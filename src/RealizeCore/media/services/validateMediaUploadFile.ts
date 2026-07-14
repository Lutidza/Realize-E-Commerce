/**
 * @file src/RealizeCore/media/services/validateMediaUploadFile.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Валидация загружаемого медиафайла по resolved runtime-настройкам.
 */

import type { PayloadRequest, ValidationFieldError } from 'payload'
import { ValidationError } from 'payload'

import type { ResolvedMediaSettings } from '@/RealizeCore/media/types/mediaSettings'

export type ValidateMediaUploadFileParams = {
  file?: PayloadRequest['file']
  req?: PayloadRequest
  settings: Pick<
    ResolvedMediaSettings,
    'allowedMimeTypes' | 'maxOriginalFileSizeBytes' | 'maxOriginalFileSizeMb'
  >
}

const bytesInMegabyte = 1024 * 1024

const formatFileSizeMb = (bytes: number) => {
  const megabytes = bytes / bytesInMegabyte

  return Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(2)
}

export const validateMediaUploadFile = ({
  file,
  req,
  settings,
}: ValidateMediaUploadFileParams) => {
  if (!file) {
    return
  }

  const errors: ValidationFieldError[] = []

  if (!settings.allowedMimeTypes.some((mimeType) => mimeType === file.mimetype)) {
    errors.push({
      path: 'file',
      message: `MIME-тип "${file.mimetype}" не разрешён для загрузки медиа. Разрешены: ${settings.allowedMimeTypes.join(', ')}.`,
    })
  }

  if (file.size > settings.maxOriginalFileSizeBytes) {
    errors.push({
      path: 'file',
      message: `Файл "${file.name}" весит ${formatFileSizeMb(file.size)} МБ. Максимальный размер: ${settings.maxOriginalFileSizeMb} МБ.`,
    })
  }

  if (errors.length > 0) {
    throw new ValidationError({
      collection: 'media',
      errors,
      req,
    })
  }
}

export default validateMediaUploadFile
