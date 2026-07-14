/**
 * @file src/RealizeCore/routes/companies/resolveCompanyFacets.ts
 * @version 0.1.0 – 2025-12-27 13:40
 * @description Преобразует attributeSelectionsData компании в набор фасетов.
 */

import type { Company } from '@/payload-types'

import type { FacetDictionary } from '@/RealizeCore/routes/shared/facets'
import type { CompanyRouteFacet } from './types'

export type CompanyAttributeSelections = Company['attributeSelectionsData']

const normalizeSelections = (
  selections: CompanyAttributeSelections,
): Record<number, { valueIds?: number[] }> => {
  if (selections && typeof selections === 'object') {
    return selections as Record<number, { valueIds?: number[] }>
  }

  if (typeof selections === 'string') {
    try {
      const parsed = JSON.parse(selections)
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<number, { valueIds?: number[] }>
      }
    } catch {
      return {}
    }
  }

  return {}
}

export type ResolveCompanyFacetsOptions = {
  allowedAttributeIds?: Set<number>
}

export const resolveCompanyFacets = (
  company: Company,
  dictionary: FacetDictionary,
  options?: ResolveCompanyFacetsOptions,
): CompanyRouteFacet[] => {
  const selections = normalizeSelections(company.attributeSelectionsData)
  const facets: CompanyRouteFacet[] = []
  const allowedIds = options?.allowedAttributeIds

  Object.entries(selections).forEach(([attributeId, selection]) => {
    const numericAttributeId = Number(attributeId)

    if (Number.isNaN(numericAttributeId)) {
      return
    }

    const valueIds = selection?.valueIds ?? []

    valueIds.forEach((valueId) => {
      if (allowedIds && !allowedIds.has(numericAttributeId)) {
        return
      }

      const entry = dictionary.byValueId[valueId]

      if (!entry) {
        return
      }

      facets.push({
        key: entry.key,
        value: String(valueId),
        valueId,
        attributeId: entry.attributeId,
        alias: entry.alias,
        order: entry.urlOrder,
        valueLabel: entry.valueLabel,
        attributeLabel: entry.attributeLabel,
      })
    })
  })

  return facets
}

export default resolveCompanyFacets
