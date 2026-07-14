/**
 * @file src/RealizeCore/srp/buildSrpHref.ts
 * @version 1.0.0 – 2026-03-02 18:20
 * @description Построение ссылок SRP на основе текущего маршрута и выбранных фасетов.
 */

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { FacetDictionary } from '@/RealizeCore/routes/shared/facets'
import { createSearchRoute } from '@/RealizeCore/routes/srp/srp.index'
import type { SrpRouteFacet, SrpRouteMatch } from '@/RealizeCore/routes/srp/srpRoutes.types'
import { buildFacetConfigMap } from './srpFacetConfig'
import type { SrpSelection } from './srpSelections'

/**
 * Преобразует набор selection’ов в DTO фасетов маршрута.
 *
 * @param selections Выбранные значения фасетов.
 * @param dictionary Глобальный словарь alias → facet/value.
 */
export const buildRouteFacetsFromSelection = (
  selections: SrpSelection[],
  dictionary: FacetDictionary,
): SrpRouteFacet[] => {
  const entries: SrpRouteFacet[] = []

  selections.forEach((selection) => {
    const entry = dictionary.byValueId[selection.valueId]

    if (!entry || entry.attributeId !== selection.attributeId) {
      return
    }

    entries.push({
      key: entry.key,
      value: entry.value,
      valueId: entry.valueId,
      attributeId: entry.attributeId,
      alias: entry.alias,
      order: entry.urlOrder,
      valueLabel: entry.valueLabel,
    })
  })

  return entries.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    }

    return a.alias.localeCompare(b.alias)
  })
}

type BuildSrpHrefParams = {
  match: SrpRouteMatch
  selections: SrpSelection[]
  dictionary: FacetDictionary
  profile: ResolvedSearchProfile
  facetConfigMap?: Map<number, ResolvedSearchProfile['facets'][number]>
}

/**
 * Строит href на SRP с учётом выбранных фильтров. Фасеты, помеченные как
 * `isFacetInPath`, остаются в path, остальные собираются в query-параметры.
 */
export const buildSrpHref = ({
  match,
  selections,
  dictionary,
  profile,
  facetConfigMap,
}: BuildSrpHrefParams): string => {
  const route = createSearchRoute(profile)
  const routeFacets = buildRouteFacetsFromSelection(selections, dictionary)
  const grouped = new Map<number, SrpRouteFacet[]>()

  routeFacets.forEach((facet) => {
    const bucket = grouped.get(facet.attributeId) ?? []
    bucket.push(facet)
    grouped.set(facet.attributeId, bucket)
  })

  const configMap = facetConfigMap ?? buildFacetConfigMap(profile)
  const pathFacets: SrpRouteFacet[] = []
  const query = new URLSearchParams()

  grouped.forEach((facets, attributeId) => {
    const facetConfig = configMap.get(attributeId)
    const facetKey = facetConfig?.key
    const shouldForceQuery = facetConfig?.isFacetInPath === false

    if (facetKey && (shouldForceQuery || facets.length > 1)) {
      query.set(
        facetKey,
        facets.map((facet) => facet.value).join(','),
      )
      return
    }

    pathFacets.push(facets[0])
  })

  const nextMatch: SrpRouteMatch = {
    ...match,
    facets: pathFacets,
    page: 1,
    hasExplicitPage: false,
    isCanonical: true,
  }

  const basePath = route.buildPath(nextMatch)
  const queryString = query.toString()
  return queryString.length > 0 ? `${basePath}?${queryString}` : basePath
}
