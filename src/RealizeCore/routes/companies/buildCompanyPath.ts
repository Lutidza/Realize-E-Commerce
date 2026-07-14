/**
 * @file src/RealizeCore/routes/companies/buildCompanyPath.ts
 * @version 0.1.0 – 2025-12-27 13:20
 * @description Сборка канонических URL каталога компаний.
 */

import { defaultLocale, supportedLocales } from '@/RealizeCore/localization'
import type { Config } from '@/payload-types'

import type { CompanyRouteFacet, CompanyRouteMatch } from './types'

const sortFacets = (facets: CompanyRouteFacet[]): CompanyRouteFacet[] =>
  [...facets].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    }

    return a.alias.localeCompare(b.alias)
  })

export const buildCompanyPath = (
  match: CompanyRouteMatch,
  overrides?: Partial<
    Pick<CompanyRouteMatch, 'locale' | 'facets' | 'cityAlias' | 'page'> & { mode?: 'list' | 'card'; allowedFacetIds?: Set<number> }
  >,
): string => {
  const locale = (overrides?.locale ?? match.locale ?? defaultLocale) as Config['locale']
  const allowedFacetIds = overrides?.allowedFacetIds
  const facets = (overrides?.facets ?? match.facets).filter((facet) =>
    allowedFacetIds ? allowedFacetIds.has(facet.attributeId) : true,
  )
  const cityAlias = overrides?.cityAlias ?? match.cityAlias
  const page = overrides?.page ?? match.page

  const segments: string[] = []

  sortFacets(facets).forEach((facet) => segments.push(facet.alias))

  if (cityAlias) {
    segments.push(cityAlias)
  }

  if (page && page > 1) {
    segments.push(`page-${page}`)
  }

  const suffix = segments.length > 0 ? `/${segments.join('/')}` : ''

  if (locale && locale !== defaultLocale && supportedLocales.includes(locale)) {
    return `/${locale}/companies${suffix}`
  }

  return `/companies${suffix}`
}

export default buildCompanyPath
