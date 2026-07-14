/**
 * @file src/RealizeCore/services/search/elasticsearch/indexers/companiesIndexer.ts
 * @version 0.1.0 – 2026-03-01 12:50
 * @description Преобразование документов companies в формат Elasticsearch.
 */

import type { Company } from '@/payload-types'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'

import { normalizeAttributeSelections } from '../utils/attributeSelections'
import { resolveRelationId } from '../utils/relations'
import { resolveCityAliasFromRelation } from '../utils/locations'

const buildFacetKeyMap = (profile?: ResolvedSearchProfile | null) => {
  const map = new Map<number, string>()

  profile?.facets?.forEach((facet) => {
    map.set(facet.attributeId, facet.key)
  })

  return map
}

const buildFacets = (
  company: Company,
  profile?: ResolvedSearchProfile | null,
) => {
  const selections = normalizeAttributeSelections(company.attributeSelectionsData)
  const map = buildFacetKeyMap(profile)
  const facets: Record<string, string[]> = {}

  Object.entries(selections).forEach(([attributeId, entry]) => {
    const attrNumeric = Number(attributeId)
    const key = map.get(attrNumeric)

    if (!key) {
      return
    }

    const values = entry.valueIds.map((value) => String(value))

    if (values.length > 0) {
      facets[key] = values
    }
  })

  return {
    facets,
    attributeSelections: selections,
  }
}

export const buildCompanyDocument = ({
  company,
  profile,
}: {
  company: Company
  profile?: ResolvedSearchProfile | null
}) => {
  const fallbackTitle = company.companyName ?? company.legalName ?? `Company #${company.id}`
  const slug =
    typeof company.slug === 'string' && company.slug.length > 0
      ? company.slug
      : `company-${company.id}`
  const urlAlias =
    typeof company.urlAlias === 'string' && company.urlAlias.length > 0
      ? company.urlAlias
      : slug

  const { facets, attributeSelections } = buildFacets(company, profile)

  return {
    collection: 'companies',
    id: company.id,
    slug,
    urlAlias,
    title: fallbackTitle,
    localeTitle: {
      default: fallbackTitle,
    },
    cityId: resolveRelationId(company.city),
    cityAlias: resolveCityAliasFromRelation(company.city),
    geoPoint: undefined,
    facets,
    attributeSelections,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

export default buildCompanyDocument
