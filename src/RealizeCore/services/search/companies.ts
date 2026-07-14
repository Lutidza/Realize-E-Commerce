/**
 * @file src/RealizeCore/services/search/companies.ts
 * @version 0.1.0 – 2025-12-27 13:30
 * @description Поиск компаний с учётом фасетов (атрибутов) и гео сегментов.
 */

import { getPayload, type PaginatedDocs, type Where } from 'payload'

import type { Company } from '@/payload-types'

import configPromise from '@/payload.config'
import { defaultLocale, normalizeLocale } from '@/RealizeCore/localization'

export type CompanySearchFacet = {
  attributeId: number
  valueIds: number[]
}

export type CompanySearchParams = {
  locale: string
  page?: number
  limit?: number
  cityAlias?: string
  facets?: CompanySearchFacet[]
}

const COLLECTION_SLUG = 'companies'
const DEFAULT_LIMIT = 20

const resolveLocaleAliasField = (alias: string, locale: string) => {
  if (!alias) {
    return undefined
  }

  return { [`urlAlias.${locale}`]: { equals: alias } }
}

const resolveCityId = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  alias?: string,
  locale?: string,
) => {
  if (!alias) {
    return null
  }

  const localeField = locale ? resolveLocaleAliasField(alias, locale) : undefined
  const fallbackField = resolveLocaleAliasField(alias, defaultLocale)

  const response = await payload.find({
    collection: 'administrative-areas',
    limit: 1,
    where: {
      and: [
        { level: { equals: 'locality' } },
        {
          or: [localeField ?? {}, fallbackField ?? {}, { slug: { equals: alias } }].filter(
            (condition) => Object.keys(condition).length > 0,
          ),
        },
      ],
    },
  })

  const match = response.docs[0]
  return typeof match?.id === 'number' ? match.id : null
}

const fetchDocIdsForFacet = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  facet: CompanySearchFacet,
): Promise<Set<number>> => {
  const response = await payload.find({
    collection: 'attribute-values-relationship',
    select: { docId: true },
    limit: 0,
    where: {
      and: [
        { collectionSlug: { equals: COLLECTION_SLUG } },
        { attribute: { equals: facet.attributeId } },
        { value: { in: facet.valueIds } },
      ],
    },
  })

  const ids = response.docs
    .map((relation) => relation.docId)
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))

  return new Set(ids)
}

const intersectDocIds = (current: Set<number> | null, next: Set<number>): Set<number> => {
  if (!current) {
    return new Set(next)
  }

  const intersection = new Set<number>()

  next.forEach((value) => {
    if (current.has(value)) {
      intersection.add(value)
    }
  })

  return intersection
}

const buildEmptyResult = (limit: number, page = 1): PaginatedDocs<Company> => ({
  docs: [],
  totalDocs: 0,
  totalPages: 0,
  limit,
  page,
  hasNextPage: false,
  hasPrevPage: false,
  pagingCounter: 0,
  nextPage: null,
  prevPage: null,
})

export const searchCompanies = async ({
  locale,
  page = 1,
  limit = DEFAULT_LIMIT,
  cityAlias,
  facets = [],
}: CompanySearchParams) => {
  const config = await configPromise
  const payload = await getPayload({ config })

  let allowedDocIds: Set<number> | null = null

  for (const facet of facets) {
    if (!facet.valueIds || facet.valueIds.length === 0) {
      continue
    }

    const facetDocIds = await fetchDocIdsForFacet(payload, facet)

    if (facetDocIds.size === 0) {
      return buildEmptyResult(limit)
    }

    allowedDocIds = intersectDocIds(allowedDocIds, facetDocIds)

    if (allowedDocIds.size === 0) {
      return buildEmptyResult(limit)
    }
  }

  const cityId = await resolveCityId(payload, cityAlias, locale)

  const whereClauses: Where[] = []

  if (allowedDocIds && allowedDocIds.size > 0) {
    whereClauses.push({ id: { in: Array.from(allowedDocIds) } })
  }

  if (cityId) {
    whereClauses.push({ city: { equals: cityId } })
  }

  const where = whereClauses.length > 0 ? { and: whereClauses } : undefined

  return payload.find({
    collection: COLLECTION_SLUG,
    locale: normalizeLocale(locale),
    depth: 2,
    where,
    page,
    limit,
  })
}

export default searchCompanies
