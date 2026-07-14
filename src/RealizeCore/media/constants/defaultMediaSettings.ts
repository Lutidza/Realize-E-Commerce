/**
 * @file src/RealizeCore/media/constants/defaultMediaSettings.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Безопасные code defaults для runtime-настроек медиа.
 */

import type { MediaSettingsDefaults } from '@/RealizeCore/media/types/mediaSettings'

export const DEFAULT_MEDIA_SETTINGS: MediaSettingsDefaults = {
  maxOriginalFileSizeMb: 25,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  outputFormats: ['avif', 'webp', 'jpeg'],
  jpegQuality: 82,
  webpQuality: 80,
  avifQuality: 55,
  presets: [
    {
      preset: 'avatar',
      enabled: true,
      width: 320,
      height: 320,
      fit: 'cover',
      useFocalPoint: true,
      allowUpscale: false,
    },
    {
      preset: 'logo',
      enabled: true,
      width: 512,
      height: 512,
      fit: 'inside',
      useFocalPoint: false,
      allowUpscale: false,
    },
    {
      preset: 'cover',
      enabled: true,
      width: 1920,
      height: 720,
      fit: 'cover',
      useFocalPoint: true,
      allowUpscale: false,
    },
    {
      preset: 'listingCard',
      enabled: true,
      width: 720,
      height: 540,
      fit: 'cover',
      useFocalPoint: true,
      allowUpscale: false,
    },
    {
      preset: 'listingGallery',
      enabled: true,
      width: 1600,
      height: 1200,
      fit: 'inside',
      useFocalPoint: true,
      allowUpscale: false,
    },
    {
      preset: 'content',
      enabled: true,
      width: 1440,
      height: 960,
      fit: 'inside',
      useFocalPoint: false,
      allowUpscale: false,
    },
  ],
  normalizeExifOrientation: true,
  extractDominantColor: true,
  extractTechnicalMetadata: true,
  keepOriginalFilenameInMetadata: true,
  settingsCacheTtlSeconds: 60,
  publicCacheMaxAgeSeconds: 31536000,
  staleWhileRevalidateSeconds: 86400,
  userUploadDefaultStatus: 'pendingReview',
  backofficeUploadDefaultStatus: 'approved',
  storageProvider: 'local',
  localBasePath: 'media',
}

export default DEFAULT_MEDIA_SETTINGS
