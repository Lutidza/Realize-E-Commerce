/**
 * @file src/RealizeCore/ui/pages/companies/CompaniesListPage.tsx
 * @version 0.1.0 – 2025-12-26 22:10
 * @description
 * Публичный список компаний (агентств и застройщиков) с краткой карточкой и CTA.
 */

import React from 'react'
import Link from 'next/link'

import type { Company } from '@/payload-types'
import { formatLocalePath } from '@/RealizeCore/localization'
import CompanyCard from '@/RealizeCore/ui/components/companies/CompanyCard'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import resolveCompanyFacets from '@/RealizeCore/routes/companies/resolveCompanyFacets'
import type { FacetDictionary, FacetAliasEntry } from '@/RealizeCore/routes/shared/facets'
import buildCompanyPath from '@/RealizeCore/routes/companies/buildCompanyPath'
import type { CompanyRouteMatch, CompanyRouteFacet } from '@/RealizeCore/routes/companies/types'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import { resolveCompanyCityAlias } from '@/RealizeCore/routes/companies/resolveCompanyCityAlias'
import CatalogFilters, {
  type CatalogFilterGroup,
} from '@/RealizeCore/ui/components/filters/CatalogFilters'

const hasUrlAlias = (
  company: Company,
): company is Company & Required<Pick<Company, 'urlAlias'>> =>
  typeof company.urlAlias === 'string' && company.urlAlias.length > 0

/**
 * @remarks
 * Рендерит основной список компаний с краткими описаниями и ссылкой в карточку.
 *
 * @param props.locale Локаль для генерации ссылок.
 * @param props.companies Список опубликованных компаний.
 * @param props.total Общее количество документов (для подсказки пользователю).
 */
export const CompaniesListPage: React.FC<{
  locale: string
  companies: Company[]
  total: number
  facetDictionary: FacetDictionary
  resolvedProfile?: ResolvedSearchProfile | null
  match: CompanyRouteMatch
}> = ({ locale, companies, total, facetDictionary, resolvedProfile, match }) => {
  const companiesWithAlias = companies.filter(hasUrlAlias)
  const hasCompanies = companiesWithAlias.length > 0
  const selectedFacets = match.facets.map((facet) => ({
    attributeId: facet.attributeId,
    valueId: facet.valueId,
  }))
  const profileFacetIds = React.useMemo(() => {
    const visibleFacets = resolvedProfile?.facets?.filter((facet) => facet.isFacetInPath) ?? []
    if (visibleFacets.length === 0) {
      return undefined
    }
    return new Set(visibleFacets.map((facet) => facet.attributeId))
  }, [resolvedProfile])

  const cardPathFacetIds = React.useMemo(() => {
    if (!resolvedProfile) {
      return undefined
    }
    return new Set(resolvedProfile.cardPathFacetIds ?? [])
  }, [resolvedProfile])

  const facetConfigByAttribute = React.useMemo(() => {
    const map = new Map<number, ResolvedSearchProfile['facets'][number]>()
    resolvedProfile?.facets?.forEach((facet) => {
      map.set(facet.attributeId, facet)
    })
    return map
  }, [resolvedProfile?.facets])

  const availableValueIds = React.useMemo(() => {
    const set = new Set<number>()
    companiesWithAlias.forEach((company) => {
      const facets = resolveCompanyFacets(company, facetDictionary, {
        allowedAttributeIds: profileFacetIds,
      })
      facets.forEach((facet) => set.add(facet.valueId))
    })
    return set
  }, [companiesWithAlias, facetDictionary, profileFacetIds])

  const buildRouteFacetsFromSelection = React.useCallback(
    (selections: Array<{ attributeId: number; valueId: number }>): CompanyRouteFacet[] => {
      const entries: CompanyRouteFacet[] = []
      selections.forEach((selection) => {
        const entry = facetDictionary.byValueId[selection.valueId]

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
          attributeLabel: entry.attributeLabel,
        })
      })

      return entries.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order
        }
        return a.alias.localeCompare(b.alias)
      })
    },
    [facetDictionary],
  )

  const buildFilterHref = React.useCallback(
    (nextSelection: Array<{ attributeId: number; valueId: number }>) => {
      const sortedFacets = buildRouteFacetsFromSelection(nextSelection)
      const grouped = new Map<number, CompanyRouteFacet[]>()

      sortedFacets.forEach((facet) => {
        const bucket = grouped.get(facet.attributeId) ?? []
        bucket.push(facet)
        grouped.set(facet.attributeId, bucket)
      })

      const pathFacets: CompanyRouteFacet[] = []
      const query = new URLSearchParams()

      grouped.forEach((facets, attributeId) => {
        const facetConfig = facetConfigByAttribute.get(attributeId)
        if (facets.length > 1 && facetConfig?.key) {
          query.set(
            facetConfig.key,
            facets.map((facet) => facet.value).join(','),
          )
        } else if (facets.length === 1) {
          pathFacets.push(facets[0])
        }
      })

      const nextMatch: CompanyRouteMatch = {
        ...match,
        facets: pathFacets,
        page: 1,
        hasExplicitPage: false,
      }

      const basePath = buildCompanyPath(nextMatch)
      const queryString = query.toString()

      return queryString.length > 0 ? `${basePath}?${queryString}` : basePath
    },
    [buildRouteFacetsFromSelection, match, facetConfigByAttribute],
  )

  const filterGroups = React.useMemo(() => {
    if (!resolvedProfile?.filterUi || resolvedProfile.filterUi.length === 0) {
      return []
    }

    const optionsByAttribute = new Map<number, FacetAliasEntry[]>()
    Object.values(facetDictionary.byValueId).forEach((entry) => {
      const bucket = optionsByAttribute.get(entry.attributeId) ?? []
      bucket.push(entry)
      optionsByAttribute.set(entry.attributeId, bucket)
    })

    const selectionKey = selectedFacets.reduce((acc, current) => {
      acc.add(`${current.attributeId}:${current.valueId}`)
      return acc
    }, new Set<string>())

    const baseSelection = selectedFacets

    const groups: CatalogFilterGroup[] = []

    resolvedProfile.filterUi.forEach((filterSetting) => {
      const facetConfig = facetConfigByAttribute.get(filterSetting.attributeId)
      if (!facetConfig?.isFacetInPath) {
        return
      }

      const attributeOptions = optionsByAttribute.get(filterSetting.attributeId)

      if (!attributeOptions || attributeOptions.length === 0) {
        return
      }

      const hasAvailabilityHints = availableValueIds.size > 0

      const groupOptions = attributeOptions.map((option) => {
        const selectionKeyValue = `${option.attributeId}:${option.valueId}`
        const isActive = selectionKey.has(selectionKeyValue)
        const nextSelection = isActive
          ? baseSelection.filter(
              (entry) =>
                !(entry.attributeId === option.attributeId && entry.valueId === option.valueId),
            )
          : [...baseSelection, { attributeId: option.attributeId, valueId: option.valueId }]
        const shouldDisable =
          hasAvailabilityHints && !isActive && !availableValueIds.has(option.valueId)

        return {
          label: option.valueLabel ?? option.value,
          valueId: option.valueId,
          isActive,
          isDisabled: shouldDisable,
          href: buildFilterHref(nextSelection),
        }
      })

      const groupLabel =
        filterSetting.label ??
        attributeOptions[0]?.attributeLabel ??
        attributeOptions[0]?.key ??
        'Filter'

      groups.push({
        key: `attribute-${filterSetting.attributeId}`,
        label: groupLabel,
        options: groupOptions,
      })
    })

    return groups
  }, [
    resolvedProfile?.filterUi,
    facetDictionary.byValueId,
    selectedFacets,
    buildFilterHref,
    facetConfigByAttribute,
    availableValueIds,
  ])

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Companies</p>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Agencies &amp; developers</h1>
          <p className="text-muted-foreground">
            Discover partners verified by Realize. We hand-pick active agencies and developers so
            you can connect with the right team faster.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{total} companies in catalog</p>
      </header>

      {filterGroups.length > 0 && <CatalogFilters groups={filterGroups} />}

      {hasCompanies ? (
        <div className="grid gap-6 md:grid-cols-2">
          {companiesWithAlias.map((company) => {
            const facets = resolveCompanyFacets(company, facetDictionary, {
              allowedAttributeIds: profileFacetIds,
            })
            const cardMatch: CompanyRouteMatch = {
              locale,
              facets,
              cityAlias: resolveCompanyCityAlias(company.city, locale),
              page: 1,
              rawSegments: [],
              hadExplicitDefaultLocale: false,
              hasExplicitPage: false,
              isCanonical: true,
            }

            const detailHref = buildCompanyPath(cardMatch, {
              facets,
              allowedFacetIds: cardPathFacetIds,
            })

            return (
              <CompanyCard
                key={company.id}
                company={company}
                facets={facets}
                detailHref={`${detailHref}/${company.urlAlias}`}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <p className="text-lg font-semibold text-foreground">No companies yet</p>
          <p className="text-sm text-muted-foreground">
            Our editorial team is still curating the catalog. Check back soon for new companies.
          </p>
          <Button
            asChild
            className="mt-6"
            variant="ghost"
          >
            <Link href={formatLocalePath(locale, '/accounts/companies/create')}>Add your company</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default CompaniesListPage
