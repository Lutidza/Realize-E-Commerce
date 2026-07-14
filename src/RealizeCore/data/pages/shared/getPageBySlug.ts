/**
 * @file src/RealizeCore/data/pages/shared/getPageBySlug.ts
 * @description Серверный резолвер страниц из коллекции Payload с поддержкой локалей и fallback.
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Config, Page } from '@/payload-types'
import { fallbackLocale, normalizeLocale } from '@/RealizeCore/localization'

export type PageSlug = string

export type FetchPageBySlugOptions = {
  locale: string
  slug: PageSlug
}

const toPayloadLocale = (value: string): Config['locale'] => normalizeLocale(value) as Config['locale']
const normalizedFallbackLocale = toPayloadLocale(fallbackLocale)

export const fetchPageBySlug = async ({ locale, slug }: FetchPageBySlugOptions) => {
  const payloadConfig = await configPromise
  const payload = await getPayload({ config: payloadConfig })

  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    fallbackLocale: normalizedFallbackLocale,
    limit: 1,
    locale: toPayloadLocale(locale),
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  const document = result.docs[0]

  if (!document) {
    return null
  }

  return document as Page
}
