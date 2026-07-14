/**
 * @file src/RealizeCore/ui/pages/listings/ListingsSrpPage.tsx
 * @version 0.1.0 – 2026-03-01 17:15
 * @description SRP листингов с фильтрами на базе Search Profile.
 */

import React from 'react'

import type { ListingSearchItem } from '@/RealizeCore/services/search/listings'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import type { SrpRouteMatch } from '@/RealizeCore/routes/srp/srpRoutes.types'
import type { FacetDictionary } from '@/RealizeCore/routes/shared/facets'
import CatalogFilters, {
  type CatalogFilterGroup,
} from '@/RealizeCore/ui/components/filters/CatalogFilters'
import {
  type AttributeSelectionsRecord,
  buildFacetConfigMap,
  buildSrpHref,
  collectAvailableValueIds,
  groupFacetDictionaryByAttribute,
  normalizeSelections,
  type SrpSelection,
} from '@/RealizeCore/srp'

const formatOptionalDate = (value: string | undefined, locale: string) =>
  value ? new Date(value).toLocaleDateString(locale) : '-'

const ListingsSrpPage: React.FC<{
  match: SrpRouteMatch
  listings: ListingSearchItem[]
  totalDocs: number
  totalPages: number
  resolvedProfile?: ResolvedSearchProfile | null
  facetDictionary: FacetDictionary
}> = ({ match, listings, totalDocs, totalPages, resolvedProfile, facetDictionary }) => {
  const selectedFacets = React.useMemo<SrpSelection[]>(() => normalizeSelections(match), [match])

  const facetConfigByAttribute = React.useMemo(() => buildFacetConfigMap(resolvedProfile), [resolvedProfile])

  const availableValueIds = React.useMemo(
    () =>
      collectAvailableValueIds(listings, (listing) => listing.attributes as AttributeSelectionsRecord),
    [listings],
  )

  const groupedDictionary = React.useMemo(
    () => groupFacetDictionaryByAttribute(facetDictionary),
    [facetDictionary],
  )

  const buildFilterHref = React.useCallback(
    (nextSelection: SrpSelection[]) => {
      if (!resolvedProfile) {
        return '#'
      }

      return buildSrpHref({
        match,
        selections: nextSelection,
        dictionary: facetDictionary,
        profile: resolvedProfile,
        facetConfigMap: facetConfigByAttribute,
      })
    },
    [match, facetDictionary, resolvedProfile, facetConfigByAttribute],
  )

  const filterGroups = React.useMemo(() => {
    const optionsByAttribute = groupedDictionary
    const selectionKey = selectedFacets.reduce((acc, current) => {
      acc.add(`${current.attributeId}:${current.valueId}`)
      return acc
    }, new Set<string>())

    const configuredSettings =
      resolvedProfile?.filterUi && resolvedProfile.filterUi.length > 0
        ? resolvedProfile.filterUi
        : Array.from(optionsByAttribute.keys()).map((attributeId) => ({
            attributeId,
            label: optionsByAttribute.get(attributeId)?.[0]?.attributeLabel ?? 'Filter',
          }))

    const groups: CatalogFilterGroup[] = []

    configuredSettings.forEach((filterSetting) => {
      const facetConfig = facetConfigByAttribute.get(filterSetting.attributeId)
      if (facetConfig && facetConfig.isFacetInPath === false) {
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
          ? selectedFacets.filter(
              (entry) =>
                !(entry.attributeId === option.attributeId && entry.valueId === option.valueId),
            )
          : [...selectedFacets, { attributeId: option.attributeId, valueId: option.valueId }]
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
        (filterSetting as { label?: string }).label ??
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
    groupedDictionary,
    selectedFacets,
    buildFilterHref,
    facetConfigByAttribute,
    availableValueIds,
  ])

  const hasListings = listings.length > 0

  return (
    <article className="space-y-10" data-srp-locale={match.locale}>
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Listings</p>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Homes &amp; apartments</h1>
          <p className="text-muted-foreground">
            Explore active listings filtered by your current selection. Adjust the filters below to
            refine the catalog.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalDocs} listings • page {match.page}
        </p>
      </header>

      {filterGroups.length > 0 && <CatalogFilters groups={filterGroups} />}

      <section className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{listings.length}</strong> of{' '}
            <strong className="text-foreground">{totalDocs}</strong> results
          </span>
          <span>
            Location:{' '}
            <strong className="text-foreground">{match.geo.city ?? 'Entire country'}</strong>
          </span>
        </div>

        {hasListings ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID {listing.id}</span>
                    <span>{match.geo.city ?? '—'}</span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-foreground">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Дата создания:{' '}
                    <span className="text-foreground">
                      {formatOptionalDate(listing.createdAt, match.locale)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Обновлено:{' '}
                    {formatOptionalDate(listing.updatedAt, match.locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-muted-foreground/60 p-6 text-center text-sm text-muted-foreground">
            Ничего не найдено. Измените фильтры или выберите другую локацию.
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Pages: <strong className="text-foreground">{totalPages}</strong>
        </p>
      </section>
    </article>
  )
}

export default ListingsSrpPage
