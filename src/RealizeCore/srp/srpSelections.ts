/**
 * @file src/RealizeCore/srp/srpSelections.ts
 * @description Типы и нормализация выборок фасетов для SRP.
 */

import type { SrpRouteMatch } from '@/RealizeCore/routes/srp/srpRoutes.types'

export type SrpSelection = {
  attributeId: number
  valueId: number
}

export type AttributeSelectionState = {
  valueIds?: Array<number | string> | null
}

export type AttributeSelectionsRecord = Record<
  string | number,
  AttributeSelectionState | null | undefined
>

export const normalizeSelections = (match: SrpRouteMatch): SrpSelection[] =>
  match.facets.map((facet) => ({
    attributeId: facet.attributeId,
    valueId: facet.valueId,
  }))

export const collectAvailableValueIds = <TItem>(
  items: TItem[],
  resolveAttributes: (item: TItem) => AttributeSelectionsRecord | null | undefined,
): Set<number> =>
  items.reduce<Set<number>>((acc, item) => {
    const attributes = resolveAttributes(item)
    if (!attributes) {
      return acc
    }

    Object.values(attributes).forEach((entry) => {
      entry?.valueIds?.forEach((value) => {
        const numeric = typeof value === 'number' ? value : Number(value)
        if (Number.isFinite(numeric)) {
          acc.add(numeric)
        }
      })
    })

    return acc
  }, new Set<number>())
