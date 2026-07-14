/**
 * @file src/RealizeCore/routes/companies/parseCompanySegments.ts
 * @version 0.1.0 – 2025-12-27 13:15
 * @description Парсер ЧПУ сегментов для публичного каталога компаний.
 */

import { defaultLocale, isSupportedLocale } from '@/RealizeCore/localization'
import { extractFacetSegments } from '@/RealizeCore/routes/shared/facets'
import { getFacetDictionary } from '@/RealizeCore/routes/shared/facets'

import type {
  CompanyRouteFacet,
  CompanyRouteMatch,
  CompanyRouteParseError,
  CompanyRouteParseResult,
} from './types'

const PAGE_SEGMENT_REGEXP = /^page-(?<page>\d+)$/

const normalizeSegments = (segments: string[]): string[] =>
  segments
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

const splitPathSegments = (path: string): string[] => normalizeSegments(path.split('/'))

const resolveLocale = (segment: string | undefined) => {
  if (segment && isSupportedLocale(segment)) {
    return {
      locale: segment,
      offset: 1,
      hadExplicitDefaultLocale: segment === defaultLocale,
    }
  }

  return {
    locale: defaultLocale,
    offset: 0,
    hadExplicitDefaultLocale: false,
  }
}

const buildError = (
  reason: CompanyRouteParseError['reason'],
  details?: Record<string, unknown>,
): CompanyRouteParseError => ({ ok: false, reason, ...(details ? { details } : {}) })

const parsePageSegment = (segment?: string): { page: number; consumed: boolean } => {
  if (!segment) {
    return { page: 1, consumed: false }
  }

  const match = segment.match(PAGE_SEGMENT_REGEXP)

  if (!match || !match.groups) {
    return { page: 1, consumed: false }
  }

  const page = Number(match.groups.page)

  if (!Number.isFinite(page) || page < 1) {
    return { page: 1, consumed: false }
  }

  return { page, consumed: true }
}

const isCanonicalFacetOrder = (facets: CompanyRouteFacet[]): boolean => {
  for (let index = 1; index < facets.length; index += 1) {
    if (facets[index - 1].order > facets[index].order) {
      return false
    }
  }

  return true
}

export const parseCompanySegments = async (
  segments: string[],
): Promise<CompanyRouteParseResult> => {
  const normalizedSegments = normalizeSegments(segments)

  const { locale, offset, hadExplicitDefaultLocale } = resolveLocale(normalizedSegments[0])
  const remainder = normalizedSegments.slice(offset)

  const facetDictionary = await getFacetDictionary('companies')
  const { facets: parsedFacets, rest } = extractFacetSegments(remainder, facetDictionary)
  const facets: CompanyRouteFacet[] = parsedFacets.map((facet) => ({
    key: facet.key,
    value: facet.value,
    valueId: facet.valueId,
    attributeId: facet.attributeId,
    alias: facet.alias,
    order: facet.order,
  }))

  let residual = [...rest]
  let cityAlias: string | undefined

  if (residual.length > 0) {
    cityAlias = residual[0]
    residual = residual.slice(1)
  }

  const { page, consumed } = parsePageSegment(residual[0])
  if (consumed) {
    residual = residual.slice(1)
  }

  if (residual.length > 0) {
    return buildError('INVALID_SEGMENT', { segment: residual[0] })
  }

  const match: CompanyRouteMatch = {
    locale,
    facets,
    cityAlias,
    page,
    rawSegments: normalizedSegments,
    hadExplicitDefaultLocale,
    hasExplicitPage: consumed,
    isCanonical: isCanonicalFacetOrder(facets) && (!consumed || page === 1),
  }

  return { ok: true, value: match }
}

export const parseCompanyPath = async (path: string) => {
  const segments = splitPathSegments(path)
  return parseCompanySegments(segments)
}

export default parseCompanySegments
