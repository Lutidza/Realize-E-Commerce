/**
 * @file src/app/(realize)/(default)/companies/[[...segments]]/page.tsx
 * @version 0.2.0 – 2025-12-27 13:30
 * @description Публичный список компаний с поддержкой ЧПУ-фильтров.
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { defaultLocale } from '@/RealizeCore/localization'
import { loadPublicCompaniesList, loadPublicCompanyByAlias } from '@/RealizeCore/routes/companies'
import parseCompanySegments from '@/RealizeCore/routes/companies/parseCompanySegments'
import buildCompanyPath from '@/RealizeCore/routes/companies/buildCompanyPath'
import { getFacetDictionary } from '@/RealizeCore/routes/shared/facets'
import CompaniesListPage from '@/RealizeCore/ui/pages/companies/CompaniesListPage'
import payloadConfig from '@payload-config'
import { getPayload } from 'payload'
import { getResolvedProfileForCollection } from '@/RealizeCore/data/searchProfiles/getResolvedProfileForCollection'
import { resolveCityId } from '@/RealizeCore/data/locations/resolveCityId'
import CompanyDetailsPage from '@/RealizeCore/ui/pages/companies/CompanyDetailsPage'
import resolveCompanyFacets from '@/RealizeCore/routes/companies/resolveCompanyFacets'
import { resolveCompanyCityAlias } from '@/RealizeCore/routes/companies/resolveCompanyCityAlias'
import type { CompanyRouteMatch } from '@/RealizeCore/routes/companies/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Companies on Realize',
  description: 'Browse verified agencies and developers working with Realize.',
}

interface PageProps {
  params: Promise<{ segments?: string[] }>
  searchParams?: Promise<Record<string, string | string[]>>
}

const buildFacetFilters = (matchFacets: Array<{ attributeId: number; valueId: number }>) => {
  const map = new Map<number, Set<number>>()

  matchFacets.forEach((facet) => {
    const bucket = map.get(facet.attributeId) ?? new Set<number>()
    bucket.add(facet.valueId)
    map.set(facet.attributeId, bucket)
  })

  return Array.from(map.entries()).map(([attributeId, values]) => ({
    attributeId,
    valueIds: Array.from(values),
  }))
}

const buildQueryFacets = (
  searchParams: Record<string, string | string[]>,
  profile: Awaited<ReturnType<typeof getResolvedProfileForCollection>>,
  dictionary: Awaited<ReturnType<typeof getFacetDictionary>>,
) => {
  if (!profile?.facets) {
    return []
  }

  const result: CompanyRouteMatch['facets'] = []
  const valueLookup = new Map<string, (typeof dictionary.byValueId)[number]>()

  Object.values(dictionary.byValueId).forEach((entry) => {
    valueLookup.set(`${entry.key}:${entry.value}`, entry)
  })

  profile.facets.forEach((facet) => {
    const rawParam = searchParams?.[facet.key]

    if (!rawParam) {
      return
    }

    const valuesArray = Array.isArray(rawParam) ? rawParam : [rawParam]
    valuesArray
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .forEach((value) => {
        const entry = valueLookup.get(`${facet.key}:${value}`)
        if (!entry) {
          return
        }

        result.push({
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
  })

  return result
}

export default async function DefaultCompaniesPage({ params, searchParams }: PageProps) {
  const { segments = [] } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const payload = await getPayload({ config: await payloadConfig })
  const resolvedProfile = await getResolvedProfileForCollection(payload, 'companies')
  const dictionary = await getFacetDictionary('companies')

  const pathSegments = [...segments]
  const parseListResult = await parseCompanySegments(pathSegments)

  if (!parseListResult.ok) {
    if (pathSegments.length === 0) {
      notFound()
    }

    const alias = pathSegments[pathSegments.length - 1]

    if (!alias) {
      notFound()
    }

    const { company, resolvedAlias } = await loadPublicCompanyByAlias({
      locale: defaultLocale,
      alias,
    })

    if (!company) {
      notFound()
    }

    const allowedIds = resolvedProfile?.facets
      ? new Set(resolvedProfile.facets.map((facet) => facet.attributeId))
      : undefined
    const facets = resolveCompanyFacets(company, dictionary, {
      allowedAttributeIds: allowedIds,
    })
    const allowedIdsForCard = resolvedProfile
      ? new Set(resolvedProfile.cardPathFacetIds ?? [])
      : undefined
    const cityAlias = resolveCompanyCityAlias(company.city, defaultLocale)
    const match: CompanyRouteMatch = {
      locale: defaultLocale,
      facets,
      cityAlias,
      page: 1,
      rawSegments: [],
      hadExplicitDefaultLocale: false,
      hasExplicitPage: false,
      isCanonical: true,
    }

    const canonicalBase = buildCompanyPath(match, {
      facets,
      allowedFacetIds: allowedIdsForCard,
    })
    const canonicalPath = `${canonicalBase}/${resolvedAlias ?? company.urlAlias ?? alias}`
    const currentPath =
      segments.length > 0 ? `/companies/${segments.join('/')}` : '/companies'

    if (canonicalPath !== currentPath) {
      notFound()
    }

    return (
      <CompanyDetailsPage
        company={company}
        locale={defaultLocale}
        facets={facets}
      />
    )
  }

  const match = parseListResult.value
  const queryFacetSegments = buildQueryFacets(resolvedSearchParams, resolvedProfile, dictionary)
  const combinedFacets = [...match.facets, ...queryFacetSegments]
  const facets = buildFacetFilters(
    combinedFacets.map((facet) => ({ attributeId: facet.attributeId, valueId: facet.valueId })),
  )

  if (match.cityAlias) {
    const cityId = await resolveCityId({
      payload,
      alias: match.cityAlias,
      locale: defaultLocale,
    })
    if (!cityId) {
      notFound()
    }
  }

  const result = await loadPublicCompaniesList({
    locale: defaultLocale,
    page: match.page,
    facets,
    cityAlias: match.cityAlias,
  })

  const canonicalPath = buildCompanyPath(match)
  const currentPath =
    pathSegments.length > 0 ? `/companies/${pathSegments.join('/')}` : '/companies'

  if (canonicalPath !== currentPath) {
    redirect(canonicalPath)
  }

  return (
    <CompaniesListPage
      companies={result.docs}
      locale={defaultLocale}
      total={result.totalDocs}
      facetDictionary={dictionary}
      resolvedProfile={resolvedProfile}
      match={{ ...match, facets: combinedFacets }}
    />
  )
}
