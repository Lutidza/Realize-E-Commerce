/**
 * @file src/RealizeCore/routes/listings/types.ts
 * @version 1.0.0 – 2025-02-18 22:55
 * @description Базовые DTO для маршрутов карточек объявлений.
 */

export type ListingRouteGeo = {
  city: string
  district?: string
  subDistrict?: string
  route?: string
}

export type ListingRouteFacet = {
  key: string
  value: string
  valueId: number
  valueLabel: string
  attributeId: number
  alias: string
  order: number
}

export type ListingRouteMatch = {
  locale: string
  facets: ListingRouteFacet[]
  geo: ListingRouteGeo
  city?: {
    id: number
    title: string
    slug: string
  }
  listing: {
    alias: string
    id: number
  }
  /**
   * Исходные сегменты пути без query/слешей.
   */
  rawSegments: string[]
  /**
   * true, если в URL явно присутствовала локаль по умолчанию (нужно для редиректа).
   */
  hadExplicitDefaultLocale: boolean
}

export type ListingRouteParseErrorReason =
  | 'NO_SEGMENTS'
  | 'UNSUPPORTED_LOCALE'
  | 'INVALID_LISTING_SEGMENT'
  | 'MISSING_GEO_SEGMENTS'
  | 'INVALID_FACET_SEGMENT'
  | 'INVALID_FACET_ORDER'

export type ListingRouteParseError = {
  ok: false
  reason: ListingRouteParseErrorReason
  details?: Record<string, unknown>
}

export type ListingRouteParseSuccess = {
  ok: true
  value: ListingRouteMatch
}

export type ListingRouteParseResult = ListingRouteParseSuccess | ListingRouteParseError

export type ListingRouteParseOptions = {
  supportedLocales?: string[]
  defaultLocale?: string
}
