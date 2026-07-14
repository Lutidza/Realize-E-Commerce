/**
 * @file src/RealizeCore/media/services/createMediaVariantPlan.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Формирует детерминированный план сгенерированных вариантов медиа без файловых побочных эффектов.
 */

import path from 'path'

import type {
  MediaOutputFormat,
  MediaPresetName,
  ResolvedMediaPreset,
  ResolvedMediaSettings,
} from '@/RealizeCore/media/types/mediaSettings'

import {
  buildMediaVariantStoragePath,
  type MediaKind,
} from './buildMediaStoragePath'
import {
  createMediaSettingsHash,
  createMediaVariantHash,
} from './createMediaProcessingHash'
import type { MediaFilenameStrategy } from './createMediaStorageIdentity'

export type MediaVariantPlanItem = {
  allowUpscale: boolean
  filename: string
  fit: ResolvedMediaPreset['fit']
  format: MediaOutputFormat
  height?: number
  mimeType: string
  preset: MediaPresetName
  quality: number
  settingsHash: string
  storagePath: string
  url?: string
  useFocalPoint: boolean
  variantHash: string
  width: number
}

export type CreateMediaVariantPlanParams = {
  basePath?: string
  crop?: Record<string, unknown>
  filenameStrategy: MediaFilenameStrategy
  focalPoint?: Record<string, unknown>
  kind: MediaKind
  mediaKey: string
  mediaKeyShort?: string
  originalHash: string
  photoRole?: string
  presetNames?: MediaPresetName[]
  seoSlug?: string
  settings: ResolvedMediaSettings
}

const mediaKindPresetNames: Record<MediaKind, readonly MediaPresetName[]> = {
  accountAvatar: ['avatar'],
  companyCover: ['cover', 'openGraph'],
  companyLogo: ['logo'],
  contentImage: ['content', 'openGraph'],
  listingCover: ['cover', 'listingCard', 'openGraph'],
  listingPhoto: ['listingCard', 'listingGallery'],
  systemImage: ['content', 'openGraph'],
}

const outputFormatMimeTypes: Record<MediaOutputFormat, string> = {
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

const createPublicUrl = ({
  publicBaseUrl,
  storagePath,
}: {
  publicBaseUrl?: string
  storagePath: string
}) => {
  if (!publicBaseUrl) {
    return undefined
  }

  return `${publicBaseUrl.replace(/\/+$/u, '')}/${storagePath.replace(/^\/+/u, '')}`
}

const getFormatQuality = (format: MediaOutputFormat, settings: ResolvedMediaSettings) => {
  if (format === 'avif') {
    return settings.avifQuality
  }

  if (format === 'webp') {
    return settings.webpQuality
  }

  return settings.jpegQuality
}

const createPresetFilter = ({
  kind,
  presetNames,
}: {
  kind: MediaKind
  presetNames?: MediaPresetName[]
}) => {
  const allowedPresetNames = new Set(presetNames ?? mediaKindPresetNames[kind])

  return (preset: ResolvedMediaPreset) => preset.enabled && allowedPresetNames.has(preset.preset)
}

const createVariantPlanItem = ({
  basePath,
  crop,
  filenameStrategy,
  focalPoint,
  format,
  kind,
  mediaKey,
  mediaKeyShort,
  originalHash,
  photoRole,
  preset,
  seoSlug,
  settings,
  settingsHash,
}: {
  basePath?: string
  crop?: Record<string, unknown>
  filenameStrategy: MediaFilenameStrategy
  focalPoint?: Record<string, unknown>
  format: MediaOutputFormat
  kind: MediaKind
  mediaKey: string
  mediaKeyShort?: string
  originalHash: string
  photoRole?: string
  preset: ResolvedMediaPreset
  seoSlug?: string
  settings: ResolvedMediaSettings
  settingsHash: string
}): MediaVariantPlanItem => {
  const quality = getFormatQuality(format, settings)
  const variantHash = createMediaVariantHash({
    allowUpscale: preset.allowUpscale,
    crop,
    fit: preset.fit,
    focalPoint,
    format,
    height: preset.height ?? null,
    originalHash,
    preset: preset.preset,
    quality,
    settingsHash,
    useFocalPoint: preset.useFocalPoint,
    width: preset.width,
  })
  const storagePath = buildMediaVariantStoragePath({
    basePath: basePath ?? settings.localBasePath,
    extension: format,
    filenameStrategy,
    kind,
    mediaKey,
    mediaKeyShort,
    photoRole,
    preset: preset.preset,
    seoSlug,
    variantHash,
  })

  return {
    allowUpscale: preset.allowUpscale,
    filename: path.posix.basename(storagePath),
    fit: preset.fit,
    format,
    height: preset.height,
    mimeType: outputFormatMimeTypes[format],
    preset: preset.preset,
    quality,
    settingsHash,
    storagePath,
    url: createPublicUrl({
      publicBaseUrl: settings.publicBaseUrl,
      storagePath,
    }),
    useFocalPoint: preset.useFocalPoint,
    variantHash,
    width: preset.width,
  }
}

/**
 * Создаёт план variants для дальнейшей обработки через сервис изображений.
 *
 * @param params Runtime-настройки, идентификаторы медиа и доменные параметры имени файла.
 * @returns Детерминированный список variants без записи в БД и без генерации файлов.
 */
export const createMediaVariantPlan = ({
  basePath,
  crop,
  filenameStrategy,
  focalPoint,
  kind,
  mediaKey,
  mediaKeyShort,
  originalHash,
  photoRole,
  presetNames,
  seoSlug,
  settings,
}: CreateMediaVariantPlanParams) => {
  const settingsHash = createMediaSettingsHash(settings)
  const presets = settings.presets.filter(
    createPresetFilter({
      kind,
      presetNames,
    }),
  )

  return presets.flatMap((preset) =>
    settings.outputFormats.map((format) =>
      createVariantPlanItem({
        crop,
        basePath,
        filenameStrategy,
        focalPoint,
        format,
        kind,
        mediaKey,
        mediaKeyShort,
        originalHash,
        photoRole,
        preset,
        seoSlug,
        settings,
        settingsHash,
      }),
    ),
  )
}
