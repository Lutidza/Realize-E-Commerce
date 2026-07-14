/**
 * @file src/RealizeCore/collections/Search/hooks/enforceSinglePublishedProfile.ts
 * @version 0.1.0 – 2026-03-01 21:10
 * @description Гарантирует, что для каждой коллекции опубликован только один Search Profile.
 *
 * Последние изменения:
 * - Добавлен beforeChange hook для проверки уникальности опубликованного профиля.
 */

import payloadConfig from '@payload-config'
import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError, getPayload } from 'payload'

import type { SearchProfile } from '@/payload-types'

/**
 * @remarks
 * При попытке публикации профиля проверяет, существует ли уже опубликованный профиль
 * для той же коллекции. Если найден другой документ, блокирует операцию.
 *
 * @param args Hook arguments из Payload.
 * @returns Исходные данные без изменений.
 * @throws Error если найден другой опубликованный профиль для коллекции.
 */
export const enforceSinglePublishedProfile: CollectionBeforeChangeHook<SearchProfile> = async ({
  data,
  originalDoc,
  req,
}) => {
  const nextStatus = data?._status ?? originalDoc?._status
  const collectionSlug = data?.collectionSlug ?? originalDoc?.collectionSlug

  if (nextStatus !== 'published' || !collectionSlug) {
    return data
  }

  const payloadClient =
    req?.payload ?? (await getPayload({ config: await payloadConfig }))

  const existing = await payloadClient.find({
    collection: 'search-profiles',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { collectionSlug: { equals: collectionSlug } },
        { _status: { equals: 'published' } },
        {
          id: {
            not_equals: originalDoc?.id ?? null,
          },
        },
      ],
    },
  })

  if (existing.totalDocs > 0) {
    throw new ValidationError({
      collection: 'search-profiles',
      errors: [
        {
          path: 'collectionSlug',
          message: `Для коллекции "${collectionSlug}" уже опубликован Search Profile. Сначала переведите существующий профиль в draft.`,
        },
      ],
      req,
    })
  }

  return data
}

export default enforceSinglePublishedProfile