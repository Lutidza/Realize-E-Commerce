/**
 * @file src/RealizeCore/collections/Search/hooks/resolveSearchProfileFieldHook.ts
 * @version 0.1.1 – 2026-03-02 14:25
 * @description Field hook, который вычисляет нормализованный Search Profile.
 */

import payloadConfig from '@payload-config'
import type { FieldHook } from 'payload'
import { getPayload } from 'payload'

import type { SearchProfile } from '@/payload-types'
import { resolveSearchProfile } from '@/RealizeCore/data/searchProfiles/resolveSearchProfile'

/**
 * @remarks
 * Возвращает готовый DTO Search Profile, объединяя атрибуты и overrides.
 * Значение используется в виртуальном JSON-поле admin UI / API.
 */
export const resolveSearchProfileFieldHook: FieldHook<SearchProfile> = async ({
  req,
  data,
  originalDoc,
}) => {
  const sourceProfile = (data || originalDoc) as SearchProfile | undefined

  if (!sourceProfile) {
    return null
  }

  const payloadClient =
    req?.payload ?? (await getPayload({ config: await payloadConfig }))

  const resolved = await resolveSearchProfile({
    payload: payloadClient,
    profile: sourceProfile,
  })

  return resolved
}

export default resolveSearchProfileFieldHook
