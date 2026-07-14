/**
 * @file src/RealizeCore/collections/Search/validations/queryFilterValidations.ts
 * @version 0.1.0 – 2026-03-01 22:55
 * @description Проверки массива queryFilters.
 */

import type { SearchProfile } from '@/payload-types'
import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import searchProfileValidationConfig from '@/RealizeCore/config/searchProfileValidation'
import {
  ValidationIssue,
} from './shared'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'

const SOURCE_PATTERN = /^[a-zA-Z0-9_.-]+$/

const resolveQueryFilterKey = (
  filter: NonNullable<SearchProfile['queryFilters']>[number],
  attribute?: FacetAttributeRecord,
): string | null => {
  if (typeof filter?.key === 'string' && filter.key.trim().length > 0) {
    return filter.key.trim()
  }

  if (attribute?.slug) {
    return attribute.slug
  }

  return null
}

export const validateQueryFilters = (
  profile: SearchProfile,
  facetMap: Map<number, FacetAttributeRecord>,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  if (!profile.queryFilters) {
    return issues
  }

  const seenKeys = new Set<string>()
  const pinnedLimit =
    searchProfileValidationConfig.complexityLimits.pinnedFacetCount
  let pinnedCount = 0

  profile.queryFilters.forEach((filter, index) => {
    if (!filter) {
      return
    }

    const attributeId = resolveRelationId(filter.attribute)
    const attribute = attributeId !== null ? facetMap.get(attributeId) : undefined
    const key = resolveQueryFilterKey(filter, attribute)

    if (!key) {
      issues.push({
        path: `queryFilters.${index}.key`,
        message: 'Укажите ключ или выберите атрибут.',
      })
      return
    }

    if (seenKeys.has(key)) {
      issues.push({
        path: `queryFilters.${index}.key`,
        message: `Ключ "${key}" уже используется.`,
      })
    } else {
      seenKeys.add(key)
    }

    if (
      filter.type === 'keyword' &&
      typeof filter.source === 'string' &&
      filter.source.trim().startsWith('facets.') &&
      !profile.facetOverrides?.some(
        (override) =>
          resolveRelationId(override?.attribute) === attributeId &&
          override?.showInFilterOverride !== false,
      )
    ) {
      issues.push({
        path: `queryFilters.${index}.source`,
        message: `Поле "${filter.source}" должно ссылаться на существующий фасет.`,
      })
    }

    const sourceValue =
      typeof filter.source === 'string' ? filter.source.trim() : ''

    if (sourceValue.length > 0 && !SOURCE_PATTERN.test(sourceValue)) {
      issues.push({
        path: `queryFilters.${index}.source`,
        message: `Поле "${sourceValue}" содержит запрещённые символы.`,
      })
    } else if (
      sourceValue.length > 0 &&
      !searchProfileValidationConfig.allowedQuerySourcePrefixes.some((prefix) =>
        sourceValue.startsWith(prefix),
      )
    ) {
      issues.push({
        path: `queryFilters.${index}.source`,
        message: `Поле "${sourceValue}" не входит в список разрешённых источников.`,
      })
    }

    if (filter.isPinned) {
      pinnedCount += 1
    }
  })

  if (pinnedCount > pinnedLimit) {
    issues.push({
      path: 'queryFilters',
      message: `Pinned query filters превышают лимит (${pinnedCount}/${pinnedLimit}).`,
    })
  }

  return issues
}
