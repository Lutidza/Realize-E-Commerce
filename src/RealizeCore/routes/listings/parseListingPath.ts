/**
 * @file src/RealizeCore/routes/listings/parseListingPath.ts
 * @version 1.0.0 – 2025-02-18 23:05
 * @description Парсер сегментов URL карточки объявления.
 */

import { defaultLocale as fallbackLocale, isSupportedLocale } from '@/RealizeCore/localization'

import type {
  ListingRouteFacet,
  ListingRouteParseError,
  ListingRouteParseOptions,
  ListingRouteParseResult,
} from './types'
import { getFacetDictionary } from '@/RealizeCore/routes/shared/facets'
import { logListingError, logListingRoute } from './debug'
import { extractFacetSegments } from '@/RealizeCore/routes/shared/facets'

const LISTING_SEGMENT_REGEXP = /^(?<alias>.+)_id-(?<id>\d+)$/

const normalizeSegments = (segments: string[]): string[] =>
  segments
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

const splitPathSegments = (path: string): string[] => {
  const rawSegments = path.split('/')
  return normalizeSegments(rawSegments)
}

const resolveLocale = (segment: string | undefined, options?: ListingRouteParseOptions) => {
  const defaultLocale = options?.defaultLocale ?? fallbackLocale

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

const buildError = (
  reason: ListingRouteParseError['reason'],
  details?: ListingRouteParseError['details'],
): ListingRouteParseError => {
  const error = {
    ok: false,
    reason,
    ...(details ? { details } : {}),
  } as ListingRouteParseError

  logListingError(error)

  return error
}

const parseListingSegment = (segment: string) => {
  const match = segment.match(LISTING_SEGMENT_REGEXP)

  if (!match || !match.groups) {
    return null
  }

  const alias = match.groups.alias?.trim() ?? ''
  const numericId = Number(match.groups.id)

  if (!alias || Number.isNaN(numericId)) {
    return null
  }

  return {
    alias,
    id: numericId,
  }
}

const ensureFacetOrder = (facets: ListingRouteFacet[]): boolean => {
  for (let index = 1; index < facets.length; index += 1) {
    if (facets[index - 1].order > facets[index].order) {
      return false
    }
  }

  return true
}

export const parseListingSegments = async (
  segments: string[],
  options?: ListingRouteParseOptions,
): Promise<ListingRouteParseResult> => {
  const normalizedSegments = normalizeSegments(segments)

  if (normalizedSegments.length === 0) {
    return buildError('NO_SEGMENTS')
  }

  const { locale, offset, hadExplicitDefaultLocale } = resolveLocale(normalizedSegments[0], options)
  const remainder = normalizedSegments.slice(offset)

  if (remainder.length < 1) {
    return buildError('INVALID_LISTING_SEGMENT')
  }

  const listingSegment = remainder[remainder.length - 1]
  const listing = parseListingSegment(listingSegment)

  if (!listing) {
    return buildError('INVALID_LISTING_SEGMENT', { segment: listingSegment })
  }

  const facetDictionary = await getFacetDictionary()
  const beforeListing = remainder.slice(0, remainder.length - 1)
  const { facets: parsedFacets, rest } = extractFacetSegments(beforeListing, facetDictionary)
  const facets: ListingRouteFacet[] = parsedFacets.map((facet) => ({ ...facet }))

  if (rest.length === 0) {
    return buildError('MISSING_GEO_SEGMENTS')
  }

  const citySegment = rest[0]
  const residualGeoSegments = rest.slice(1)
  const districtSegment = residualGeoSegments[0]
  const subDistrictSegment = residualGeoSegments[1]
  const routeSegment = residualGeoSegments[2]

  if (residualGeoSegments.length > 0) {
    // TODO: подключить районы/улицы при появлении справочника.
    logListingRoute({ step: 'geo-residual', segments: residualGeoSegments })
  }

  if (!ensureFacetOrder(facets)) {
    return buildError('INVALID_FACET_ORDER')
  }

  const match = {
    locale,
    facets,
    geo: {
      city: citySegment,
      district: districtSegment,
      subDistrict: subDistrictSegment,
      route: routeSegment,
    },
    listing,
    rawSegments: normalizedSegments,
    hadExplicitDefaultLocale,
  }

  logListingRoute({ step: 'match', match })

  return {
    ok: true,
    value: match,
  }
}

export const parseListingPath = async (
  path: string,
  options?: ListingRouteParseOptions,
): Promise<ListingRouteParseResult> => {
  const segments = splitPathSegments(path)
  return parseListingSegments(segments, options)
}

export default parseListingPath
