/**
 * @file src/RealizeCore/data/companies/fetchPublicCompanyByUrlAlias.ts
 * @version 0.1.0 – 2025-12-27 11:25
 * @description Возвращает публичную компанию по локализованному urlAlias.
 */

import { getPayload, type TypedLocale } from 'payload'

import type { Company } from '@/payload-types'
import configPromise from '@payload-config'

export const fetchPublicCompanyByUrlAlias = async ({
  locale,
  alias,
}: {
  locale: string
  alias: string
}): Promise<Company | null> => {
  const payload = await getPayload({ config: await configPromise })
  const payloadLocale = locale as TypedLocale

  const result = await payload.find({
    collection: 'companies',
    locale: payloadLocale,
    depth: 2,
    limit: 1,
    where: {
      and: [{ urlAlias: { equals: alias } }, { state: { equals: 'enable' } }],
    },
  })

  return (result.docs[0] as Company | undefined) ?? null
}
