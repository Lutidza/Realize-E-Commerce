/**
 * @file src/RealizeCore/services/search/elasticsearch/indexers/listingsIndexer.ts
 * @version 0.1.0 – 2026-03-01 12:50
 * @description Преобразование документов listings в формат Elasticsearch.
 */

import type { Listing } from '@/payload-types'
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
  listing: Listing,
  profile?: ResolvedSearchProfile | null,
) => {
  const selections = normalizeAttributeSelections(listing.attributeSelectionsData)
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

export const buildListingDocument = ({
  listing,
  profile,
}: {
  listing: Listing
  profile?: ResolvedSearchProfile | null
}) => {
  const fallbackTitle = listing.title ?? `Listing #${listing.id}`
  const slug =
    typeof listing.slug === 'string' && listing.slug.length > 0
      ? listing.slug
      : `listing-${listing.id}`
  const urlAlias =
    typeof listing.urlAlias === 'string' && listing.urlAlias.length > 0
      ? listing.urlAlias
      : slug

  const { facets, attributeSelections } = buildFacets(listing, profile)

  return {
    collection: 'listings',
    id: listing.id,
    slug,
    urlAlias,
    title: fallbackTitle,
    localeTitle: {
      default: fallbackTitle,
    },
    cityId: resolveRelationId(listing.city),
    cityAlias: resolveCityAliasFromRelation(listing.city),
    geoPoint: undefined,
    facets,
    attributeSelections,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  }
}

export default buildListingDocument
