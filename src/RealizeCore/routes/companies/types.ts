/**
 * @file src/RealizeCore/routes/companies/types.ts
 * @version 0.1.0 – 2025-12-27 13:10
 * @description Типы роутинга публичного каталога компаний.
 */

export type CompanyRouteFacet = {
  key: string
  value: string
  valueId: number
  attributeId: number
  alias: string
  order: number
  valueLabel?: string
  attributeLabel?: string
}

export type CompanyRouteMatch = {
  locale: string
  facets: CompanyRouteFacet[]
  cityAlias?: string
  page: number
  rawSegments: string[]
  hadExplicitDefaultLocale: boolean
  hasExplicitPage: boolean
  isCanonical: boolean
}

export type CompanyRouteParseErrorReason =
  | 'NO_SEGMENTS'
  | 'INVALID_SEGMENT'

export type CompanyRouteParseError = {
  ok: false
  reason: CompanyRouteParseErrorReason
  details?: Record<string, unknown>
}

export type CompanyRouteParseResult =
  | { ok: true; value: CompanyRouteMatch }
  | CompanyRouteParseError
