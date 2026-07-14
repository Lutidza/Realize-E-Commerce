/**
 * @file src/RealizeCore/services/search/elasticsearch/utils/locations.ts
 * @version 0.1.0 – 2026-03-01 15:20
 * @description Утилиты для извлечения алиасов локаций из Payload-отношений.
 */

import type { AdministrativeArea } from '@/payload-types'
import { localizationSettings } from '@/RealizeCore/localization/config'

const CANONICAL_LOCALE = localizationSettings.canonicalLocale

type MaybeAdministrativeArea =
  | AdministrativeArea
  | number
  | {
      id?: number | string
      slug?: string
      urlAlias?: string | Record<string, string> | null
    }
  | null
  | undefined

export const resolveCityAliasFromRelation = (
  city: MaybeAdministrativeArea,
  locale: string = CANONICAL_LOCALE,
): string | undefined => {
  if (!city || typeof city !== 'object') {
    return undefined
  }

  const area = city as AdministrativeArea & { urlAlias?: string | Record<string, string> | null }
  if (typeof area.urlAlias === 'string') {
    return area.urlAlias
  }

  return area.urlAlias?.[locale] ?? area.slug ?? undefined
}

export default resolveCityAliasFromRelation
