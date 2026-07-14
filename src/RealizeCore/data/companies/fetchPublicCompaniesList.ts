/**
 * @file src/RealizeCore/data/companies/fetchPublicCompaniesList.ts
 * @version 0.1.0 – 2025-12-27 11:25
 * @description Получение списка публичных компаний с учётом локали и пагинации.
 */

import { getPayload, type PaginatedDocs, type TypedLocale } from 'payload'

import type { Company } from '@/payload-types'
import configPromise from '@payload-config'

const DEFAULT_LIST_LIMIT = 20

export const fetchPublicCompaniesList = async ({
  locale,
  page,
  limit = DEFAULT_LIST_LIMIT,
}: {
  locale: string
  page?: number
  limit?: number
}): Promise<PaginatedDocs<Company>> => {
  const payload = await getPayload({ config: await configPromise })
  const payloadLocale = locale as TypedLocale

  const result = await payload.find({
    collection: 'companies',
    locale: payloadLocale,
    depth: 2,
    sort: '-createdAt',
    page: page ?? 1,
    limit,
    where: {
      state: { equals: 'enable' },
    },
  })

  return result as PaginatedDocs<Company>
}

export const PUBLIC_COMPANIES_DEFAULT_LIMIT = DEFAULT_LIST_LIMIT
