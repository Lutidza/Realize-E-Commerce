/**
 * @file src/RealizeCore/media/services/mediaSettingsService.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Runtime-сервис чтения, нормализации и кеширования настроек медиа.
 */

import type { Payload } from 'payload'

import { DEFAULT_MEDIA_SETTINGS } from '@/RealizeCore/media/constants/defaultMediaSettings'
import type {
  MediaMimeType,
  MediaModerationStatus,
  MediaOutputFormat,
  MediaPresetFit,
  MediaPresetName,
  MediaSettingsDefaults,
  MediaStorageProvider,
  ResolvedMediaPreset,
  ResolvedMediaSettings,
} from '@/RealizeCore/media/types/mediaSettings'
import type { MediaSetting } from '@/payload-types'

const mediaSettingsSlug = 'media-settings'
const megabyte = 1024 * 1024
const allowedMimeTypes = new Set<MediaMimeType>(DEFAULT_MEDIA_SETTINGS.allowedMimeTypes)
const allowedOutputFormats = new Set<MediaOutputFormat>(DEFAULT_MEDIA_SETTINGS.outputFormats)
const allowedPresetNames = new Set<MediaPresetName>([
  'avatar',
  'logo',
  'cover',
  'listingCard',
  'listingGallery',
  'content',
  'openGraph',
])
const allowedPresetFits = new Set<MediaPresetFit>(['cover', 'inside', 'contain'])
const allowedModerationStatuses = new Set<MediaModerationStatus>([
  'draft',
  'pendingReview',
  'approved',
  'rejected',
  'quarantined',
])
const allowedStorageProviders = new Set<MediaStorageProvider>(['local', 's3'])

type MediaSettingsCacheEntry = {
  expiresAt: number
  settings: ResolvedMediaSettings
}

export type GetResolvedMediaSettingsParams = {
  forceRefresh?: boolean
  now?: number
  payload: Payload
}

let mediaSettingsCache: MediaSettingsCacheEntry | null = null

const resolveNumber = ({
  fallback,
  max,
  min,
  value,
}: {
  fallback: number
  max: number
  min: number
  value: unknown
}) => {
  const numeric = Number(value)

  if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
    return fallback
  }

  return numeric
}

const resolveBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

const resolveEnumValue = <T extends string>({
  allowed,
  fallback,
  value,
}: {
  allowed: ReadonlySet<T>
  fallback: T
  value: unknown
}) => (typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback)

const resolveEnumArray = <T extends string>({
  allowed,
  fallback,
  value,
}: {
  allowed: ReadonlySet<T>
  fallback: T[]
  value: unknown
}) => {
  if (!Array.isArray(value)) {
    return [...fallback]
  }

  const normalized = value.filter((item): item is T =>
    typeof item === 'string' && allowed.has(item as T),
  )

  return normalized.length > 0 ? normalized : [...fallback]
}

const resolvePublicBaseUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().replace(/\/+$/u, '')

  return normalized.length > 0 ? normalized : undefined
}

const resolveLocalBasePath = (value: unknown) => {
  if (typeof value !== 'string') {
    return DEFAULT_MEDIA_SETTINGS.localBasePath
  }

  const normalized = value.trim().replace(/\\/gu, '/').replace(/^\/+|\/+$/gu, '')

  if (!normalized || normalized.split('/').includes('..')) {
    return DEFAULT_MEDIA_SETTINGS.localBasePath
  }

  return normalized
}

const createPresetsByName = (presets: ResolvedMediaPreset[]) =>
  presets.reduce<Partial<Record<MediaPresetName, ResolvedMediaPreset>>>((acc, preset) => {
    acc[preset.preset] = preset
    return acc
  }, {})

const resolvePreset = (
  rawPreset: Partial<MediaSetting['presets'][number]> | undefined,
  fallback: ResolvedMediaPreset,
): ResolvedMediaPreset => ({
  preset: resolveEnumValue({
    allowed: allowedPresetNames,
    fallback: fallback.preset,
    value: rawPreset?.preset,
  }),
  enabled: resolveBoolean(rawPreset?.enabled, fallback.enabled),
  width: resolveNumber({
    value: rawPreset?.width,
    fallback: fallback.width,
    min: 1,
    max: 8000,
  }),
  height:
    rawPreset?.height === null || rawPreset?.height === undefined
      ? fallback.height
      : resolveNumber({
          value: rawPreset.height,
          fallback: fallback.height ?? fallback.width,
          min: 1,
          max: 8000,
        }),
  fit: resolveEnumValue({
    allowed: allowedPresetFits,
    fallback: fallback.fit,
    value: rawPreset?.fit,
  }),
  useFocalPoint: resolveBoolean(rawPreset?.useFocalPoint, fallback.useFocalPoint),
  allowUpscale: resolveBoolean(rawPreset?.allowUpscale, fallback.allowUpscale),
})

const resolvePresets = (value: unknown) => {
  const incomingPresets = Array.isArray(value) ? value : []
  const incomingByName = new Map<MediaPresetName, Partial<MediaSetting['presets'][number]>>()

  for (const preset of incomingPresets) {
    if (
      preset &&
      typeof preset === 'object' &&
      'preset' in preset &&
      typeof preset.preset === 'string' &&
      allowedPresetNames.has(preset.preset as MediaPresetName)
    ) {
      incomingByName.set(preset.preset as MediaPresetName, preset)
    }
  }

  return DEFAULT_MEDIA_SETTINGS.presets.map((fallback) =>
    resolvePreset(incomingByName.get(fallback.preset), fallback),
  )
}

const resolveSettingsDefaults = (
  document: Partial<MediaSetting> | null | undefined,
): MediaSettingsDefaults => ({
  maxOriginalFileSizeMb: resolveNumber({
    value: document?.maxOriginalFileSizeMb,
    fallback: DEFAULT_MEDIA_SETTINGS.maxOriginalFileSizeMb,
    min: 1,
    max: 200,
  }),
  allowedMimeTypes: resolveEnumArray({
    value: document?.allowedMimeTypes,
    fallback: DEFAULT_MEDIA_SETTINGS.allowedMimeTypes,
    allowed: allowedMimeTypes,
  }),
  outputFormats: resolveEnumArray({
    value: document?.outputFormats,
    fallback: DEFAULT_MEDIA_SETTINGS.outputFormats,
    allowed: allowedOutputFormats,
  }),
  jpegQuality: resolveNumber({
    value: document?.jpegQuality,
    fallback: DEFAULT_MEDIA_SETTINGS.jpegQuality,
    min: 1,
    max: 100,
  }),
  webpQuality: resolveNumber({
    value: document?.webpQuality,
    fallback: DEFAULT_MEDIA_SETTINGS.webpQuality,
    min: 1,
    max: 100,
  }),
  avifQuality: resolveNumber({
    value: document?.avifQuality,
    fallback: DEFAULT_MEDIA_SETTINGS.avifQuality,
    min: 1,
    max: 100,
  }),
  presets: resolvePresets(document?.presets),
  normalizeExifOrientation: resolveBoolean(
    document?.normalizeExifOrientation,
    DEFAULT_MEDIA_SETTINGS.normalizeExifOrientation,
  ),
  extractDominantColor: resolveBoolean(
    document?.extractDominantColor,
    DEFAULT_MEDIA_SETTINGS.extractDominantColor,
  ),
  extractTechnicalMetadata: resolveBoolean(
    document?.extractTechnicalMetadata,
    DEFAULT_MEDIA_SETTINGS.extractTechnicalMetadata,
  ),
  keepOriginalFilenameInMetadata: resolveBoolean(
    document?.keepOriginalFilenameInMetadata,
    DEFAULT_MEDIA_SETTINGS.keepOriginalFilenameInMetadata,
  ),
  settingsCacheTtlSeconds: resolveNumber({
    value: document?.settingsCacheTtlSeconds,
    fallback: DEFAULT_MEDIA_SETTINGS.settingsCacheTtlSeconds,
    min: 5,
    max: 3600,
  }),
  publicCacheMaxAgeSeconds: resolveNumber({
    value: document?.publicCacheMaxAgeSeconds,
    fallback: DEFAULT_MEDIA_SETTINGS.publicCacheMaxAgeSeconds,
    min: 0,
    max: 31536000,
  }),
  staleWhileRevalidateSeconds: resolveNumber({
    value: document?.staleWhileRevalidateSeconds,
    fallback: DEFAULT_MEDIA_SETTINGS.staleWhileRevalidateSeconds,
    min: 0,
    max: 604800,
  }),
  userUploadDefaultStatus: resolveEnumValue({
    value: document?.userUploadDefaultStatus,
    fallback: DEFAULT_MEDIA_SETTINGS.userUploadDefaultStatus,
    allowed: allowedModerationStatuses,
  }),
  backofficeUploadDefaultStatus: resolveEnumValue({
    value: document?.backofficeUploadDefaultStatus,
    fallback: DEFAULT_MEDIA_SETTINGS.backofficeUploadDefaultStatus,
    allowed: allowedModerationStatuses,
  }),
  storageProvider: resolveEnumValue({
    value: document?.storageProvider,
    fallback: DEFAULT_MEDIA_SETTINGS.storageProvider,
    allowed: allowedStorageProviders,
  }),
  localBasePath: resolveLocalBasePath(document?.localBasePath),
  publicBaseUrl: resolvePublicBaseUrl(document?.publicBaseUrl),
})

export const buildResolvedMediaSettings = ({
  document,
  resolvedAt = new Date().toISOString(),
}: {
  document?: Partial<MediaSetting> | null
  resolvedAt?: string
}): ResolvedMediaSettings => {
  const settings = resolveSettingsDefaults(document)

  return {
    ...settings,
    maxOriginalFileSizeBytes: settings.maxOriginalFileSizeMb * megabyte,
    presetsByName: createPresetsByName(settings.presets),
    resolvedAt,
  }
}

export const invalidateMediaSettingsCache = () => {
  mediaSettingsCache = null
}

export const getResolvedMediaSettings = async ({
  forceRefresh = false,
  now = Date.now(),
  payload,
}: GetResolvedMediaSettingsParams): Promise<ResolvedMediaSettings> => {
  if (!forceRefresh && mediaSettingsCache && mediaSettingsCache.expiresAt > now) {
    return mediaSettingsCache.settings
  }

  const document = await payload.findGlobal({
    slug: mediaSettingsSlug,
    depth: 0,
    overrideAccess: true,
  })
  const settings = buildResolvedMediaSettings({
    document,
    resolvedAt: new Date(now).toISOString(),
  })

  mediaSettingsCache = {
    settings,
    expiresAt: now + settings.settingsCacheTtlSeconds * 1000,
  }

  return settings
}

export default getResolvedMediaSettings
