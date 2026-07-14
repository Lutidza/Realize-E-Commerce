/**
 * @file src/RealizeCore/data/searchProfiles/resolveSearchProfile.ts
 * @version 0.2.0 – 2026-03-02 13:45
 * @description Собирает ResolvedSearchProfile на базе SearchProfile payload.
 */

import type { Payload } from 'payload'

import type { SearchProfile } from '@/payload-types'
import { getFacetAttributes } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import type { ResolvedSearchProfile, ResolvedSort } from '@/RealizeCore/data/searchProfiles/types'
import { buildFilterUiConfigurations } from '@/RealizeCore/data/searchProfiles/helpers/buildFilterUiConfigurations'
import { buildQueryFilters } from '@/RealizeCore/data/searchProfiles/helpers/queryFilters'
import { buildFacetOverrideMap, mergeFacetAttributes, resolveDefaultSort } from '@/RealizeCore/data/searchProfiles/helpers'

/**
 * @remarks
 * Сливает данные Search Profile с актуальными атрибутами/сортировками коллекции.
 *
 * @param payload Payload client.
 * @param profile Документ Search Profile.
 */
export const resolveSearchProfile = async ({
  payload,
  profile,
}: {
  payload: Payload
  profile: SearchProfile
}): Promise<ResolvedSearchProfile> => {
  const limits = profile.limits
  if (!limits) {
    throw new Error('SearchProfile.limits must be configured')
  }

  const collectionSlug = profile.collectionSlug

  const facetAttributes = await getFacetAttributes(payload, collectionSlug)
  const facetMap = new Map<number, (typeof facetAttributes)[number]>(
    facetAttributes.map((attribute) => [attribute.id, attribute]),
  )

  const facetOverrideMap = buildFacetOverrideMap(profile.facetOverrides)
  const resolvedFacets = mergeFacetAttributes(facetAttributes, facetOverrideMap, facetMap)

  const filterUi = buildFilterUiConfigurations(profile.filterUiSettings, facetMap)

  const resolvedSorts: ResolvedSort[] = [resolveDefaultSort(profile)]
  const resolvedDefaultSort = resolvedSorts[0]

  const resolvedQueryFilters = buildQueryFilters(
    profile.queryFilters,
    facetMap,
  )

  return {
    collectionSlug,
    indexAlias: profile.indexAlias ?? null,
    facets: resolvedFacets,
    cardPathFacetIds: resolvedFacets
      .filter((facet) => facet.useInCardPath)
      .map((facet) => facet.attributeId),
    filterUi,
    sorts: resolvedSorts,
    defaultSort: resolvedDefaultSort ?? undefined,
    queryFilters: resolvedQueryFilters,
    limits: {
      maxFacetBuckets: limits.maxFacetBuckets ?? 0,
      aggCountBudget: limits.aggCountBudget ?? 0,
      bucketCountBudget: limits.bucketCountBudget ?? 0,
    },
  }
}

export default resolveSearchProfile
