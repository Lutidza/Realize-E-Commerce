/**
 * @file src/RealizeCore/data/locations/resolveCityId.ts
 * @version 0.1.0 – 2026-02-28 11:05
 * @description Утилита для поиска идентификатора города по alias/slug.
 */

import type { Payload } from 'payload'

import { localizationSettings } from '@/RealizeCore/localization/config'

const resolveLocaleAliasField = (alias: string, locale: string) => {
  if (!alias) {
    return undefined
  }

  return { [`urlAlias.${locale}`]: { equals: alias } }
}

export const resolveCityId = async ({
  payload,
  alias,
  locale,
}: {
  payload: Payload
  alias?: string
  locale?: string
}): Promise<number | null> => {
  if (!alias) {
    return null
  }

  const localeField = locale ? resolveLocaleAliasField(alias, locale) : undefined
  const fallbackField = resolveLocaleAliasField(alias, localizationSettings.defaultLocale)

  const response = await payload.find({
    collection: 'administrative-areas',
    limit: 1,
    where: {
      and: [
        { level: { equals: 'locality' } },
        {
          or: [
            localeField ?? {},
            fallbackField ?? {},
            { slug: { equals: alias } },
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      ],
    },
  })

  const match = response.docs[0]
  return typeof match?.id === 'number' ? match.id : null
}

export default resolveCityId
