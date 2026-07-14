/**
 * @file src/RealizeCore/routes/companies/loadCompanies.ts
 * @version 0.1.0 – 2025-12-26 22:05
 * @description Серверные загрузчики данных компаний для публичных страниц.
 */

import type { Company } from '@/payload-types'
import { fetchPublicCompanyByUrlAlias } from '@/RealizeCore/data/companies'
import type { PaginatedDocs } from 'payload'
import { searchCompanies } from '@/RealizeCore/services/search/companies'
import type { CompanySearchFacet } from '@/RealizeCore/services/search/companies'

export const loadPublicCompaniesList = async ({
  locale,
  page,
  limit,
  facets,
  cityAlias,
}: {
  locale: string
  page?: number
  limit?: number
  facets?: CompanySearchFacet[]
  cityAlias?: string
}): Promise<PaginatedDocs<Company>> => {
  return searchCompanies({
    locale,
    page,
    limit,
    cityAlias,
    facets,
  })
}

export const loadPublicCompanyByAlias = async ({
  locale,
  alias,
}: {
  locale: string
  alias: string
}): Promise<{
  company: Company | null
  resolvedAlias?: string
  isExactAliasMatch?: boolean
}> => {
  const byAlias = await fetchPublicCompanyByUrlAlias({ locale, alias })

  if (byAlias) {
    return {
      company: byAlias,
      resolvedAlias: byAlias.urlAlias ?? alias,
      isExactAliasMatch: true,
    }
  }

  return { company: null }
}
