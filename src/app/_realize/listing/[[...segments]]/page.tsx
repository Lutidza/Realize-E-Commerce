/**
 * @file src/app/(realize)/listing/[[...segments]]/page.tsx
 * @version 0.2.0 – 2026-03-01 17:30
 * @description Catch-all маршрут листингов (детальные страницы и SRP).
 */

import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { parseListingPath } from '@/RealizeCore/routes/listings'
import { createSearchRoute } from '@/RealizeCore/routes/srp/srp.index'
import type { SrpRouteFacet } from '@/RealizeCore/routes/srp/srpRoutes.types'
import ListingDetailPage from '@/RealizeCore/ui/pages/listings/ListingDetailPage'
import ListingsSrpPage from '@/RealizeCore/ui/pages/listings/ListingsSrpPage'
import type { ListingSearchItem } from '@/RealizeCore/services/search/listings'
import payloadConfig from '@payload-config'
import { getPayload } from 'payload'
import { getResolvedProfileForCollection } from '@/RealizeCore/data/searchProfiles/getResolvedProfileForCollection'
import { getFacetDictionary, type FacetDictionary } from '@/RealizeCore/routes/shared/facets'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import normalizeFilterState from '@/RealizeCore/services/search/api/normalizeFilterState'
import { resolveCityId } from '@/RealizeCore/data/locations/resolveCityId'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageParams = {
  segments?: string[]
}

type PageProps = {
  params: Promise<PageParams>
  searchParams?: Promise<Record<string, string | string[]>>
}

const resolveSearchApiBaseUrl = () => {
  if (process.env.SEARCH_API_BASE_URL) {
    return process.env.SEARCH_API_BASE_URL
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

const buildQueryFacets = (
  searchParams: Record<string, string | string[]>,
  profile: ResolvedSearchProfile | null,
  dictionary: FacetDictionary,
): SrpRouteFacet[] => {
  if (!profile?.facets) {
    return []
  }

  const valueLookup = new Map<string, (typeof dictionary.byValueId)[number]>()
  Object.values(dictionary.byValueId).forEach((entry) => {
    valueLookup.set(`${entry.key}:${entry.value}`, entry)
  })

  const result: SrpRouteFacet[] = []

  profile.facets.forEach((facet) => {
    const rawParam = searchParams[facet.key]
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
        })
      })
  })

  return result
}

export default async function ListingCatchAllPage({ params, searchParams }: PageProps) {
  const headerEntries = await headers()
  const headerValues = {
    originalPath: headerEntries.get('x-realize-original-path'),
  }

  const { segments = [] } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rawSegments = segments

  const lastSegment = rawSegments[rawSegments.length - 1]
  const isListingPath = lastSegment ? /_id-\d+$/.test(lastSegment) : false

  if (!isListingPath) {
    const payload = await getPayload({ config: await payloadConfig })
    const resolvedProfile = await getResolvedProfileForCollection(payload, 'listings')
    const dictionary = await getFacetDictionary('listings')
    const route = createSearchRoute(resolvedProfile)
    const parsedSrp = await route.parseSegments(rawSegments)

    if (!parsedSrp.ok) {
      notFound()
    }

    if (
      !parsedSrp.value.isCanonical ||
      parsedSrp.value.hadExplicitDefaultLocale ||
      (parsedSrp.value.hasExplicitPage && parsedSrp.value.page === 1)
    ) {
      const canonicalPath = route.buildPath(parsedSrp.value)
      const requestedPath = headerValues.originalPath ?? `/${rawSegments.join('/')}`

      if (canonicalPath !== requestedPath) {
        redirect(canonicalPath)
      }
    }

    const cityAlias = parsedSrp.value.geo.city
    const cityId = cityAlias
      ? await resolveCityId({
          payload,
          alias: cityAlias,
          locale: parsedSrp.value.locale,
        })
      : null

    if (cityAlias && !cityId) {
      notFound()
    }

    const queryFacetSegments = buildQueryFacets(resolvedSearchParams, resolvedProfile, dictionary)
    const combinedFacets = [...parsedSrp.value.facets, ...queryFacetSegments]

    const snapshot = normalizeFilterState({
      facets: combinedFacets.reduce<Record<string, string[]>>((acc, facet) => {
        const entries = acc[facet.key] ?? []
        entries.push(facet.value)
        acc[facet.key] = entries
        return acc
      }, {}),
      query: resolvedSearchParams,
      geo: { cityAlias },
    })

    const baseUrl = resolveSearchApiBaseUrl()

    const searchResponse = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'listings',
        locale: parsedSrp.value.locale,
        page: parsedSrp.value.page,
        snapshot,
        include: {
          hits: true,
          counts: true,
          ranges: false,
        },
      }),
    })

    const searchPayload = (await searchResponse.json().catch(() => null)) as {
      ok?: boolean
      hits?: ListingSearchItem[]
      total?: number
      pageInfo?: { totalPages?: number }
    } | null

    if (!searchResponse.ok || !searchPayload?.ok) {
      throw new Error('SEARCH_API_ERROR')
    }

    return (
      <ListingsSrpPage
        match={{ ...parsedSrp.value, facets: combinedFacets }}
        listings={searchPayload.hits ?? []}
        totalDocs={searchPayload.total ?? 0}
        totalPages={searchPayload.pageInfo?.totalPages ?? 1}
        resolvedProfile={resolvedProfile}
        facetDictionary={dictionary}
      />
    )
  }

  const parsed = await parseListingPath(['', ...rawSegments].join('/'))

  if (!parsed.ok) {
    notFound()
  }

  return <ListingDetailPage match={parsed.value} />
}
