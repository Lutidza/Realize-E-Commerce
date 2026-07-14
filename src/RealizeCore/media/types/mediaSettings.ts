/**
 * @file src/RealizeCore/media/types/mediaSettings.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Типы resolved runtime-настроек медиа.
 */

import type { MediaSetting } from '@/payload-types'

export type MediaMimeType = MediaSetting['allowedMimeTypes'][number]
export type MediaOutputFormat = MediaSetting['outputFormats'][number]
export type MediaPresetName = MediaSetting['presets'][number]['preset']
export type MediaPresetFit = MediaSetting['presets'][number]['fit']
export type MediaModerationStatus = MediaSetting['userUploadDefaultStatus']
export type MediaStorageProvider = MediaSetting['storageProvider']

export type ResolvedMediaPreset = {
  preset: MediaPresetName
  enabled: boolean
  width: number
  height?: number
  fit: MediaPresetFit
  useFocalPoint: boolean
  allowUpscale: boolean
}

export type MediaSettingsDefaults = {
  maxOriginalFileSizeMb: number
  allowedMimeTypes: MediaMimeType[]
  outputFormats: MediaOutputFormat[]
  jpegQuality: number
  webpQuality: number
  avifQuality: number
  presets: ResolvedMediaPreset[]
  normalizeExifOrientation: boolean
  extractDominantColor: boolean
  extractTechnicalMetadata: boolean
  keepOriginalFilenameInMetadata: boolean
  settingsCacheTtlSeconds: number
  publicCacheMaxAgeSeconds: number
  staleWhileRevalidateSeconds: number
  userUploadDefaultStatus: MediaModerationStatus
  backofficeUploadDefaultStatus: MediaModerationStatus
  storageProvider: MediaStorageProvider
  localBasePath: string
  publicBaseUrl?: string
}

export type ResolvedMediaSettings = MediaSettingsDefaults & {
  maxOriginalFileSizeBytes: number
  presetsByName: Partial<Record<MediaPresetName, ResolvedMediaPreset>>
  resolvedAt: string
}
