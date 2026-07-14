/**
 * @file src/RealizeCore/collections/Search/validations/facetValidations.ts
 * @version 0.1.0 – 2026-03-01 22:55
 * @description Проверки facet overrides.
 */

import type { SearchProfile } from '@/payload-types'
import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import {
  MAX_CARD_PATH_FACETS,
  MAX_CARD_PATH_VALUE_COUNT,
  ValidationIssue,
} from './shared'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'

export const buildFacetMap = (
  records: FacetAttributeRecord[],
): Map<number, FacetAttributeRecord> => {
  const map = new Map<number, FacetAttributeRecord>()
  records.forEach((record) => map.set(record.id, record))
  return map
}

const resolveFacetOrder = (
  override: NonNullable<SearchProfile['facetOverrides']>[number],
  attribute?: FacetAttributeRecord,
): number | null => {
  if (typeof override?.urlOrderOverride === 'number') {
    return override.urlOrderOverride
  }

  if (typeof attribute?.facetPriority === 'number') {
    return attribute.facetPriority
  }

  return null
}

export const validateFacetOverrides = (
  profile: SearchProfile,
  facetMap: Map<number, FacetAttributeRecord>,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  if (!profile.facetOverrides) {
    return issues
  }

  const seenAttributeIds = new Set<number>()
  const usedOrders = new Map<number, string>()
  let cardPathCount = 0
  let cardPathValueBudget = 0

  profile.facetOverrides.forEach((override, index) => {
    if (!override) {
      return
    }

    const attributeId = resolveRelationId(override.attribute)

    if (attributeId === null) {
      issues.push({
        path: `facetOverrides.${index}.attribute`,
        message: 'Выберите атрибут для override.',
      })
      return
    }

    if (seenAttributeIds.has(attributeId)) {
      issues.push({
        path: `facetOverrides.${index}.attribute`,
        message: 'Атрибут уже переопределён.',
      })
    } else {
      seenAttributeIds.add(attributeId)
    }

    const attribute = facetMap.get(attributeId)
    if (!attribute) {
      issues.push({
        path: `facetOverrides.${index}.attribute`,
        message: 'Атрибут недоступен для этой коллекции.',
      })
    }

    if (override.useInCardPath && override.isFacetInPath !== true) {
      issues.push({
        path: `facetOverrides.${index}.useInCardPath`,
        message: 'Фасет должен быть в пути, чтобы использоваться в карточке.',
      })
    }

    if (override.useInCardPath) {
      cardPathCount += 1
    }

    if (override.isFacetInPath) {
      const order = resolveFacetOrder(override, attribute)
      if (order === null) {
        issues.push({
          path: `facetOverrides.${index}.urlOrderOverride`,
          message: 'Укажите порядок фасета в URL.',
        })
      } else if (usedOrders.has(order)) {
        issues.push({
          path: `facetOverrides.${index}.urlOrderOverride`,
          message: `Порядок ${order} уже занят (${usedOrders.get(order)}).`,
        })
      } else {
        const label =
          attribute?.slug ??
          attribute?.name ??
          (typeof attributeId === 'number' ? String(attributeId) : 'facet')
        usedOrders.set(order, label)
      }
    }
    if (override.useInCardPath) {
      cardPathValueBudget += attribute?.values?.length ?? 0
    }

    if (override.isFacetInPath) {
      const resolvedFormat =
        override.urlFormatOverride ?? attribute?.facetFormat ?? null
      if (!resolvedFormat) {
        issues.push({
          path: `facetOverrides.${index}.urlFormatOverride`,
          message: 'Укажите формат URL для фасета в пути.',
        })
      }

      if (override.countsMode === 'lazy') {
        issues.push({
          path: `facetOverrides.${index}.countsMode`,
          message: 'Фасет в пути не может использовать lazy counts.',
        })
      }
    }

    if (
      override.isPinnedFacet &&
      override.valueSource === 'composite'
    ) {
      issues.push({
        path: `facetOverrides.${index}.valueSource`,
        message: 'Pinned фасет не может использовать composite source.',
      })
    }

    if (
      override.valueSource === 'composite' &&
      override.countsMode === 'disjunctive'
    ) {
      issues.push({
        path: `facetOverrides.${index}.countsMode`,
        message: 'Composite фасет нельзя использовать с disjunctive counts.',
      })
    }
  })

  if (cardPathCount > MAX_CARD_PATH_FACETS) {
    issues.push({
      path: 'facetOverrides',
      message: `Сегментов в карточке слишком много (${cardPathCount}/${MAX_CARD_PATH_FACETS}).`,
    })
  }

  if (cardPathValueBudget > MAX_CARD_PATH_VALUE_COUNT) {
    issues.push({
      path: 'facetOverrides',
      message: `Карточный путь содержит слишком много значений (${cardPathValueBudget}/${MAX_CARD_PATH_VALUE_COUNT}).`,
    })
  }

  return issues
}
