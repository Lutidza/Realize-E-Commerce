/**
 * @file src/RealizeCore/services/search/api/budget.ts
 * @version 0.1.0 – 2026-03-01 23:10
 * @description Подсчёт и проверка бюджетов агрегаций Search API.
 */

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import searchProfileValidationConfig from '@/RealizeCore/config/searchProfileValidation'
import { BudgetExceededError } from './errors'

const DEFAULT_BUCKET_LIMIT = 25

const resolveAggBudgetLimit = (profile: ResolvedSearchProfile) =>
  profile.limits.aggCountBudget ||
  searchProfileValidationConfig.complexityLimits.aggCountBudget

const resolveBucketBudgetLimit = (profile: ResolvedSearchProfile) =>
  profile.limits.bucketCountBudget ||
  searchProfileValidationConfig.complexityLimits.bucketCountBudget

export const resolveFacetBucketSize = (profile: ResolvedSearchProfile) =>
  profile.limits.maxFacetBuckets || DEFAULT_BUCKET_LIMIT

export const enforceFacetAggregationBudget = ({
  profile,
  targetCount,
}: {
  profile: ResolvedSearchProfile
  targetCount: number
}) => {
  const aggLimit = resolveAggBudgetLimit(profile)
  if (targetCount > aggLimit) {
    throw new BudgetExceededError({
      budget: 'aggCountBudget',
      limit: aggLimit,
      actual: targetCount,
    })
  }

  const bucketSize = resolveFacetBucketSize(profile)
  const bucketConsumption = targetCount * bucketSize
  const bucketLimit = resolveBucketBudgetLimit(profile)

  if (bucketConsumption > bucketLimit) {
    throw new BudgetExceededError({
      budget: 'bucketCountBudget',
      limit: bucketLimit,
      actual: bucketConsumption,
    })
  }

  return bucketSize
}
