/**
 * @file src/RealizeCore/media/services/buildMediaStoragePath.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Формирует безопасные storage paths для originals и variants медиа.
 */

import type { MediaOutputFormat, MediaPresetName } from '@/RealizeCore/media/types/mediaSettings'
import type { Media } from '@/payload-types'

import type { MediaFilenameStrategy } from './createMediaStorageIdentity'

export type MediaKind = Media['kind']

export type BuildMediaOriginalStoragePathParams = {
  basePath?: string
  extension: string
  kind: MediaKind
  mediaKey: string
  originalHash: string
}

export type BuildMediaVariantStoragePathParams = {
  basePath?: string
  extension: MediaOutputFormat | string
  filenameStrategy: MediaFilenameStrategy
  kind: MediaKind
  mediaKey: string
  mediaKeyShort?: string
  photoRole?: string
  preset: MediaPresetName | string
  seoSlug?: string
  variantHash: string
}

const defaultBasePath = 'media'
const maxSeoFilenameBaseLength = 110
const mediaKindPathMap: Record<MediaKind, string> = {
  accountAvatar: 'accounts/avatars',
  companyCover: 'companies/covers',
  companyLogo: 'companies/logos',
  contentImage: 'content/images',
  listingCover: 'listings/covers',
  listingPhoto: 'listings/photos',
  systemImage: 'system/images',
}
const outputFormatExtensions: Record<string, string> = {
  avif: 'avif',
  jpeg: 'jpg',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
}

const normalizePathSeparators = (value: string) => value.replace(/\\/gu, '/')

const sanitizeSegment = (value: string, fallback: string) => {
  const normalized = normalizePathSeparators(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gu, '-')
    .replace(/^-+|-+$/gu, '')

  return normalized && normalized !== '..' ? normalized : fallback
}

const sanitizeHash = (value: string, fallback: string) => {
  const normalized = value.toLowerCase().replace(/[^a-f0-9]/gu, '')

  return normalized || fallback
}

const resolveBasePath = (basePath: string | undefined) =>
  normalizePathSeparators(basePath ?? defaultBasePath)
    .split('/')
    .map((segment) => sanitizeSegment(segment, defaultBasePath))
    .filter(Boolean)
    .join('/') || defaultBasePath

const resolveExtension = (extension: string) => {
  const normalized = sanitizeSegment(extension.replace(/^\./u, ''), 'bin')

  return outputFormatExtensions[normalized] ?? normalized
}

const trimSeoFilenameBase = (value: string) =>
  value.slice(0, maxSeoFilenameBaseLength).replace(/-+$/u, '') || 'media'

const buildSeoVariantFilename = ({
  mediaKey,
  mediaKeyShort,
  photoRole,
  seoSlug,
  variantHash,
}: Pick<
  BuildMediaVariantStoragePathParams,
  'mediaKey' | 'mediaKeyShort' | 'photoRole' | 'seoSlug' | 'variantHash'
>) => {
  const stableMediaKey = sanitizeSegment(mediaKeyShort ?? mediaKey.replace(/^m_/u, ''), 'media')
  const seoFilenameBase = trimSeoFilenameBase(sanitizeSegment(seoSlug ?? 'media', 'media'))

  return [
    seoFilenameBase,
    photoRole ? sanitizeSegment(photoRole, 'image') : undefined,
    stableMediaKey,
    sanitizeHash(variantHash, 'hash'),
  ]
    .filter(Boolean)
    .join('-')
}

const buildOpaqueVariantFilename = ({
  mediaKey,
  variantHash,
}: Pick<BuildMediaVariantStoragePathParams, 'mediaKey' | 'variantHash'>) =>
  `${sanitizeSegment(mediaKey, 'media')}-${sanitizeHash(variantHash, 'hash')}`

/**
 * Строит path для оригинального файла с opaque naming.
 *
 * @param params Данные identity оригинала и доменный kind медиа.
 * @returns Относительный storage path внутри выбранного media base path.
 */
export const buildMediaOriginalStoragePath = ({
  basePath,
  extension,
  kind,
  mediaKey,
  originalHash,
}: BuildMediaOriginalStoragePathParams) =>
  [
    resolveBasePath(basePath),
    'originals',
    mediaKindPathMap[kind],
    sanitizeSegment(mediaKey, 'media'),
    `${sanitizeHash(originalHash, 'hash')}.${resolveExtension(extension)}`,
  ].join('/')

/**
 * Строит path для generated variant с SEO или opaque naming.
 *
 * @param params Данные variant, naming strategy и доменный kind медиа.
 * @returns Относительный storage path внутри выбранного media base path.
 */
export const buildMediaVariantStoragePath = ({
  basePath,
  extension,
  filenameStrategy,
  kind,
  mediaKey,
  mediaKeyShort,
  photoRole,
  preset,
  seoSlug,
  variantHash,
}: BuildMediaVariantStoragePathParams) => {
  const filename =
    filenameStrategy === 'seo'
      ? buildSeoVariantFilename({
          mediaKey,
          mediaKeyShort,
          photoRole,
          seoSlug,
          variantHash,
        })
      : buildOpaqueVariantFilename({
          mediaKey,
          variantHash,
        })

  return [
    resolveBasePath(basePath),
    'variants',
    mediaKindPathMap[kind],
    sanitizeSegment(preset, 'preset'),
    `${filename}.${resolveExtension(extension)}`,
  ].join('/')
}
