/**
 * @file src/RealizeCore/routes/srp/helpers/routeNormalizationHelper.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Набор нормализаторов сегментов SRP-маршрутов.
 */

import { isSupportedLocale } from '@/RealizeCore/localization'

import type { SrpRouteFacet, SrpRouteMatch } from '../srpRoutes.types'
import { sortFacets } from './routeOrderingHelper'

export const normalizeSegments = (segments: string[]): string[] =>
  segments
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

export const splitPathSegments = (path: string): string[] => {
  const rawSegments = path.split('/')
  return normalizeSegments(rawSegments)
}

export const resolveLocaleSegment = (segment: string | undefined, defaultLocale: string) => {
  if (segment && isSupportedLocale(segment)) {
    const hadExplicitDefaultLocale = segment === defaultLocale

    return {
      locale: segment,
      offset: 1,
      hadExplicitDefaultLocale,
    }
  }

  return {
    locale: defaultLocale,
    offset: 0,
    hadExplicitDefaultLocale: false,
  }
}

export const normalizeLocalePrefix = (locale: string, defaultLocale: string): string[] => {
  if (!isSupportedLocale(locale)) {
    return []
  }

  if (locale === defaultLocale) {
    return []
  }

  return [locale]
}

export const normalizeFacetSegments = (facets: SrpRouteFacet[]): string[] =>
  sortFacets(facets)
    .map((facet) => facet.alias?.trim())
    .filter((segment): segment is string => Boolean(segment && segment.length > 0))

export const normalizeGeoSegments = (geo: SrpRouteMatch['geo']): string[] => {
  const segments: string[] = []

  if (geo.city) {
    segments.push(geo.city)
  }

  if (geo.district) {
    segments.push(geo.district)
  }

  if (geo.subDistrict) {
    segments.push(geo.subDistrict)
  }

  if (geo.route) {
    segments.push(geo.route)
  }

  return segments
}

export const normalizePageSegment = (page?: number): string[] => {
  if (!page || page <= 1) {
    return []
  }

  return [`page-${page}`]
}
