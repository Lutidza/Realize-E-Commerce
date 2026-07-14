/**
 * @file src/RealizeCore/routes/srp/createRouteParser.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Конструктор парсера SRP-сегментов на базе контекста маршрута.
 */

import type { FacetDictionary } from '@/RealizeCore/routes/shared/facets'
import { extractFacetSegments } from '@/RealizeCore/routes/shared/facets'

import type {
  SrpRouteFacet,
  SrpRouteMatch,
  SrpRouteParseResult,
} from './srpRoutes.types'
import {
  normalizeSegments,
  resolveLocaleSegment,
  splitPathSegments,
} from './helpers/routeNormalizationHelper'
import { parsePageSegment } from './helpers/pageSegmentHelper'
import { buildRouteError } from './helpers/routeErrorsHelper'
import { isCanonicalFacetOrder, sortFacets } from './helpers/routeOrderingHelper'

export type RouteParserContext = {
  collectionSlug: string
  defaultLocale: string
  fetchDictionary: (collectionSlug: string) => Promise<FacetDictionary>
}

export const createRouteParser = (context: RouteParserContext) => {
  const parseSegments = async (segments: string[]): Promise<SrpRouteParseResult> => {
    const normalizedSegments = normalizeSegments(segments)

    if (normalizedSegments.length === 0) {
      return buildRouteError('NO_SEGMENTS')
    }

    const { locale, offset, hadExplicitDefaultLocale } = resolveLocaleSegment(
      normalizedSegments[0],
      context.defaultLocale,
    )
    const remainder = normalizedSegments.slice(offset)

    if (remainder[0] !== context.collectionSlug) {
      return buildRouteError('INVALID_COLLECTION_SEGMENT', {
        expected: context.collectionSlug,
        received: remainder[0],
      })
    }

    const segmentsAfterSlug = remainder.slice(1)
    const facetDictionary = await context.fetchDictionary(context.collectionSlug)
    const { facets: parsedFacets, rest } = extractFacetSegments(segmentsAfterSlug, facetDictionary)
    const facets: SrpRouteFacet[] = parsedFacets.map((facet) => ({ ...facet }))

    if (rest.length === 0) {
      return buildRouteError('MISSING_GEO_SEGMENTS')
    }

    let residual = [...rest]
    let page = 1
    let hadExplicitPage = false

    if (residual.length > 0) {
      const lastSegment = residual[residual.length - 1]
      const parsedPage = parsePageSegment(lastSegment)

      if (parsedPage !== null) {
        page = parsedPage
        hadExplicitPage = true
        residual = residual.slice(0, -1)
      }
    }

    const [citySegment, district, subDistrict, route, ...unknown] = residual

    if (unknown.length > 0) {
      return buildRouteError('INVALID_FACET_SEGMENT', { segment: unknown[0] })
    }

    if (!isCanonicalFacetOrder(facets)) {
      return buildRouteError('INVALID_FACET_ORDER')
    }

    const match: SrpRouteMatch = {
      locale,
      facets: sortFacets(facets),
      geo: {
        city: citySegment,
        district,
        subDistrict,
        route,
      },
      page,
      rawSegments: normalizedSegments,
      hadExplicitDefaultLocale,
      isCanonical: !hadExplicitPage || page === 1,
      hasExplicitPage: hadExplicitPage,
    }

    return {
      ok: true,
      value: match,
    }
  }

  const parsePath = async (path: string) => {
    const segments = splitPathSegments(path)
    return parseSegments(segments)
  }

  return {
    parseSegments,
    parsePath,
  }
}

export default createRouteParser
