/**
 * @file src/RealizeCore/collections/Search/validations/complexityValidation.ts
 * @version 0.1.0 – 2026-03-01 22:55
 * @description Проверки complexity score профиля.
 */

import type { SearchProfile } from '@/payload-types'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import searchProfileValidationConfig from '@/RealizeCore/config/searchProfileValidation'
import type { ValidationIssue } from './shared'

export const validateComplexity = (
  profile: SearchProfile,
  resolvedProfile: ResolvedSearchProfile | null,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []
  const limits = searchProfileValidationConfig.complexityLimits

  const facets = resolvedProfile?.facets ?? []

  const pinnedCount = facets.filter((facet) => facet.isPinnedFacet).length
  if (pinnedCount > limits.pinnedFacetCount) {
    issues.push({
      path: 'facetOverrides',
      message: `Pinned фасетов слишком много (${pinnedCount}/${limits.pinnedFacetCount}).`,
    })
  }

  const disjunctiveCount = facets.filter(
    (facet) => facet.countsMode === 'disjunctive',
  ).length
  if (disjunctiveCount > limits.disjunctiveFacetCount) {
    issues.push({
      path: 'facetOverrides',
      message: `Превышен лимит disjunctive фасетов (${disjunctiveCount}/${limits.disjunctiveFacetCount}).`,
    })
  }

  const compositeCount = facets.filter(
    (facet) => facet.valueSource === 'composite',
  ).length
  if (compositeCount > limits.highCardinalityFacetCount) {
    issues.push({
      path: 'facetOverrides',
      message: `Слишком много фасетов с высокой кардинальностью (${compositeCount}/${limits.highCardinalityFacetCount}).`,
    })
  }

  const aggBudget = profile.limits?.aggCountBudget ?? 0
  if (aggBudget > limits.aggCountBudget) {
    issues.push({
      path: 'limits.aggCountBudget',
      message: `aggCountBudget (${aggBudget}) превышает лимит (${limits.aggCountBudget}).`,
    })
  }

  const bucketBudget = profile.limits?.bucketCountBudget ?? 0
  if (bucketBudget > limits.bucketCountBudget) {
    issues.push({
      path: 'limits.bucketCountBudget',
      message: `bucketCountBudget (${bucketBudget}) превышает лимит (${limits.bucketCountBudget}).`,
    })
  }

  return issues
}
