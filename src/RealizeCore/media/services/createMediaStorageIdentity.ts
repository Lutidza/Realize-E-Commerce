/**
 * @file src/RealizeCore/media/services/createMediaStorageIdentity.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Формирует безопасную storage identity для загружаемого media-файла.
 */

import { createHash, randomBytes } from 'crypto'
import { createReadStream } from 'fs'
import path from 'path'
import type { PayloadRequest } from 'payload'

import type { Media } from '@/payload-types'

export type MediaFilenameStrategy = Media['filenameStrategy']
export type MediaKind = Media['kind']

export type MediaStorageIdentity = {
  filenameStrategy: MediaFilenameStrategy
  mediaKey: string
  mediaKeyShort: string
  originalExtension: string
  originalFilesize: number
  originalHash: string
  originalMimeType: string
  safeOriginalFilename: string
}

export type CreateMediaStorageIdentityParams = {
  existingMediaKey?: null | string
  file: NonNullable<PayloadRequest['file']>
  filenameStrategy?: MediaFilenameStrategy | null
  kind?: MediaKind | null
  mediaKeyFactory?: () => string
}

const mediaKeyPattern = /^[a-z0-9][a-z0-9_-]{11,63}$/u
const maxFilenameBaseLength = 80
const mediaKindFilenameStrategies: Partial<Record<MediaKind, MediaFilenameStrategy>> = {
  contentImage: 'seo',
  listingPhoto: 'seo',
}
const mimeTypeExtensions: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const createDefaultMediaKey = () =>
  `m_${Date.now().toString(36)}_${randomBytes(12).toString('hex')}`

const normalizePathSeparators = (value: string) => value.replace(/\\/gu, '/')

const removeCombiningMarks = (value: string) =>
  value.normalize('NFKD').replace(/[\u0300-\u036f]/gu, '')

const sanitizeFilenameBase = (value: string) => {
  const normalized = removeCombiningMarks(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')

  return normalized.slice(0, maxFilenameBaseLength).replace(/-+$/u, '') || 'upload'
}

const resolveExtensionFromName = (name: string) => {
  const extension = path.extname(name).replace(/^\./u, '').toLowerCase()

  return /^[a-z0-9]{1,12}$/u.test(extension) ? extension : undefined
}

const resolveOriginalExtension = (file: NonNullable<PayloadRequest['file']>) =>
  mimeTypeExtensions[file.mimetype] ?? resolveExtensionFromName(file.name) ?? 'bin'

const resolveSafeOriginalFilename = ({
  extension,
  originalName,
}: {
  extension: string
  originalName: string
}) => {
  const basename = path.posix.basename(normalizePathSeparators(originalName))
  const baseWithoutExtension = basename.slice(0, basename.length - path.extname(basename).length)

  return `${sanitizeFilenameBase(baseWithoutExtension)}.${extension}`
}

const resolveFilenameStrategy = ({
  filenameStrategy,
  kind,
}: {
  filenameStrategy?: MediaFilenameStrategy | null
  kind?: MediaKind | null
}): MediaFilenameStrategy => {
  if (filenameStrategy) {
    return filenameStrategy
  }

  return kind ? (mediaKindFilenameStrategies[kind] ?? 'opaque') : 'opaque'
}

const resolveMediaKey = ({
  existingMediaKey,
  mediaKeyFactory,
}: {
  existingMediaKey?: null | string
  mediaKeyFactory: () => string
}) => {
  if (existingMediaKey && mediaKeyPattern.test(existingMediaKey)) {
    return existingMediaKey
  }

  const mediaKey = mediaKeyFactory().toLowerCase()

  return mediaKeyPattern.test(mediaKey) ? mediaKey : createDefaultMediaKey()
}

const createHashFromStream = (tempFilePath: string) =>
  new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(tempFilePath)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })

const createOriginalHash = async (file: NonNullable<PayloadRequest['file']>) => {
  if (file.data.length > 0) {
    return createHash('sha256').update(file.data).digest('hex')
  }

  if (file.tempFilePath) {
    return createHashFromStream(file.tempFilePath)
  }

  return createHash('sha256').update(Buffer.from('')).digest('hex')
}

/**
 * Создаёт storage identity без записи в Payload и без файловых side effects.
 *
 * @param params Параметры загруженного файла и доменного назначения media.
 * @returns Безопасные идентификаторы и metadata для последующей записи в media document.
 */
export const createMediaStorageIdentity = async ({
  existingMediaKey,
  file,
  filenameStrategy,
  kind,
  mediaKeyFactory = createDefaultMediaKey,
}: CreateMediaStorageIdentityParams): Promise<MediaStorageIdentity> => {
  const mediaKey = resolveMediaKey({
    existingMediaKey,
    mediaKeyFactory,
  })
  const originalExtension = resolveOriginalExtension(file)

  return {
    filenameStrategy: resolveFilenameStrategy({
      filenameStrategy,
      kind,
    }),
    mediaKey,
    mediaKeyShort: mediaKey.replace(/^m_/u, '').slice(0, 10),
    originalExtension,
    originalFilesize: file.size,
    originalHash: await createOriginalHash(file),
    originalMimeType: file.mimetype,
    safeOriginalFilename: resolveSafeOriginalFilename({
      extension: originalExtension,
      originalName: file.name,
    }),
  }
}

export default createMediaStorageIdentity
