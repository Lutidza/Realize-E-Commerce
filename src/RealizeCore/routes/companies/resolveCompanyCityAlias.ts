/**
 * @file src/RealizeCore/routes/companies/resolveCompanyCityAlias.ts
 * @version 0.1.0 – 2026-03-01 11:20
 * @description Вспомогательная функция определения алиаса города для компании.
 */

import type { Company, AdministrativeArea } from '@/payload-types'

export const resolveCompanyCityAlias = (
  city: Company['city'],
  locale: string,
): string | undefined => {
  if (city && typeof city === 'object') {
    const area = city as AdministrativeArea & { urlAlias?: Record<string, string> }
    return area.urlAlias?.[locale] ?? area.slug ?? undefined
  }

  return undefined
}

export default resolveCompanyCityAlias
