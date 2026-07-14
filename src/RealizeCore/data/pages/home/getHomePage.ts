/**
 * @file src/RealizeCore/data/pages/home/getHomePage.ts
 * @version 1.0.0 – 2025-02-18 13:10
 * @description Хелпер для получения документа главной страницы.
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Home } from '@/payload-types'
import type { TypedLocale } from 'payload'

import { fallbackLocale, normalizeLocale } from '@/RealizeCore/localization'

export const HOME_GLOBAL_SLUG = 'home'

const toPayloadLocale = (value: string): TypedLocale => normalizeLocale(value) as TypedLocale
const toFallbackLocale = (): TypedLocale => fallbackLocale as TypedLocale
export const getHomePage = async (locale: string): Promise<Home | null> => {
  const payloadConfig = await configPromise
  const payload = await getPayload({ config: payloadConfig })

  try {
    const document = await payload.findGlobal({
      slug: HOME_GLOBAL_SLUG,
      depth: 1,
      locale: toPayloadLocale(locale),
      fallbackLocale: toFallbackLocale(),
    })

    return document as Home
  } catch (error) {
    console.error('[getHomePage] Failed to fetch home global', error)
    return null
  }
}
