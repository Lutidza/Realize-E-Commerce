/**
 * @file src/RealizeCore/routes/srp/srpRoutes.types.ts
 * @version 1.0.0 – 2025-02-19 08:25
 * @description DTO для маршрутов поисковой выдачи.
 */

export type SrpRouteGeo = {
  city?: string
  district?: string
  subDistrict?: string
  route?: string
}

export type SrpRouteFacet = {
  key: string
  value: string
  valueId: number
  valueLabel: string
  attributeId: number
  /**
   * Канонический сегмент фасета (attributeAlias-valueAlias или valueAlias).
   */
  alias: string
  order: number
}

export type SrpRouteMatch = {
  locale: string
  facets: SrpRouteFacet[]
  geo: SrpRouteGeo
  city?: {
    id: number
    title: string
    slug: string
  }
  page: number
  rawSegments: string[]
  hadExplicitDefaultLocale: boolean
  isCanonical: boolean
  hasExplicitPage: boolean
}

export type SrpRouteParseErrorReason =
  | 'NO_SEGMENTS'
  | 'INVALID_COLLECTION_SEGMENT'
  | 'INVALID_FACET_SEGMENT'
  | 'INVALID_FACET_ORDER'
  | 'MISSING_GEO_SEGMENTS'
  | 'UNKNOWN_CITY'
  | 'INVALID_PAGE_SEGMENT'

export type SrpRouteParseError = {
  ok: false
  reason: SrpRouteParseErrorReason
  details?: Record<string, unknown>
}

export type SrpRouteParseSuccess = {
  ok: true
  value: SrpRouteMatch
}

export type SrpRouteParseResult = SrpRouteParseSuccess | SrpRouteParseError
