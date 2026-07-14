/**
 * @file src/RealizeCore/media/services/createMediaProcessingHash.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Создаёт стабильные hash-значения для media settings и variants.
 */

import { createHash } from 'crypto'

import type {
  MediaOutputFormat,
  MediaPresetFit,
  MediaPresetName,
  ResolvedMediaPreset,
  ResolvedMediaSettings,
} from '@/RealizeCore/media/types/mediaSettings'

export type MediaVariantHashParams = {
  allowUpscale?: boolean
  crop?: Record<string, unknown>
  fit?: MediaPresetFit
  focalPoint?: Record<string, unknown>
  format: MediaOutputFormat
  height?: number | null
  originalHash: string
  preset: MediaPresetName | string
  quality: number
  settingsHash: string
  trim?: Record<string, unknown>
  useFocalPoint?: boolean
  width: number
}

type JsonPrimitive = boolean | null | number | string
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined }

const hashVersion = 'media-hash-v1'
const hashLength = 16

const createSha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, hashLength)

const normalizeValue = (value: unknown): JsonValue | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item) ?? null)
  }

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, JsonValue>>((acc, key) => {
        const normalized = normalizeValue((value as Record<string, unknown>)[key])

        if (normalized !== undefined) {
          acc[key] = normalized
        }

        return acc
      }, {})
  }

  return String(value)
}

const stableStringify = (value: unknown) => JSON.stringify(normalizeValue(value))

const createHashPayload = (scope: string, value: unknown) =>
  stableStringify({
    scope,
    value,
    version: hashVersion,
  })

const createSettingsPresetPayload = (preset: ResolvedMediaPreset) => ({
  allowUpscale: preset.allowUpscale,
  enabled: preset.enabled,
  fit: preset.fit,
  height: preset.height ?? null,
  preset: preset.preset,
  useFocalPoint: preset.useFocalPoint,
  width: preset.width,
})

/**
 * Создаёт hash processing-настроек, влияющих на variants.
 *
 * @param settings Resolved media settings из runtime-сервиса настроек.
 * @returns Короткий SHA-256 hash для записи в `settingsHash`.
 */
export const createMediaSettingsHash = (
  settings: Pick<
    ResolvedMediaSettings,
    | 'avifQuality'
    | 'extractDominantColor'
    | 'extractTechnicalMetadata'
    | 'jpegQuality'
    | 'normalizeExifOrientation'
    | 'outputFormats'
    | 'presets'
    | 'webpQuality'
  >,
) =>
  createSha256(
    createHashPayload('settings', {
      avifQuality: settings.avifQuality,
      extractDominantColor: settings.extractDominantColor,
      extractTechnicalMetadata: settings.extractTechnicalMetadata,
      jpegQuality: settings.jpegQuality,
      normalizeExifOrientation: settings.normalizeExifOrientation,
      outputFormats: [...settings.outputFormats].sort(),
      presets: settings.presets
        .map(createSettingsPresetPayload)
        .sort((left, right) => left.preset.localeCompare(right.preset)),
      webpQuality: settings.webpQuality,
    }),
  )

/**
 * Создаёт hash generated variant для cache-busting имени файла.
 *
 * @param params Параметры оригинала, preset, output format и applied settings.
 * @returns Короткий SHA-256 hash для записи в `variantHash`.
 */
export const createMediaVariantHash = (params: MediaVariantHashParams) =>
  createSha256(
    createHashPayload('variant', {
      allowUpscale: params.allowUpscale ?? false,
      crop: params.crop,
      fit: params.fit ?? null,
      focalPoint: params.focalPoint,
      format: params.format,
      height: params.height ?? null,
      originalHash: params.originalHash,
      preset: params.preset,
      quality: params.quality,
      settingsHash: params.settingsHash,
      trim: params.trim,
      useFocalPoint: params.useFocalPoint ?? false,
      width: params.width,
    }),
  )
