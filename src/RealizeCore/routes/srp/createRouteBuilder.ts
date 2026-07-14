/**
 * @file src/RealizeCore/routes/srp/createRouteBuilder.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Конструктор генератора URL SRP-маршрутов.
 */

import type { SrpRouteMatch, SrpRouteFacet } from './srpRoutes.types'
import {
  normalizeFacetSegments,
  normalizeGeoSegments,
  normalizeLocalePrefix,
  normalizePageSegment,
} from './helpers/routeNormalizationHelper'

export type RouteBuilderContext = {
  collectionSlug: string
  defaultLocale: string
}

export const createRouteBuilder = (context: RouteBuilderContext) => {
  const buildPath = (
    match: SrpRouteMatch,
    overrides?: {
      facets?: SrpRouteFacet[]
      page?: number
      geo?: SrpRouteMatch['geo']
      locale?: string
    },
  ) => {
    const activeLocale = overrides?.locale ?? match.locale
    const facets = overrides?.facets ?? match.facets
    const geo = overrides?.geo ?? match.geo
    const page = overrides?.page ?? match.page

    const localeSegments = normalizeLocalePrefix(activeLocale, context.defaultLocale)
    const segments = [
      ...localeSegments,
      context.collectionSlug,
      ...normalizeFacetSegments(facets),
      ...normalizeGeoSegments(geo),
      ...normalizePageSegment(page),
    ].filter((segment) => segment && segment.length > 0)

    if (segments.length === 0) {
      return '/'
    }

    return `/${segments.join('/')}`
  }

  return {
    buildPath,
  }
}

export default createRouteBuilder
