/**
 * @file src/RealizeCore/collections/Search/hooks/validateSearchProfileBeforeChange.ts
 * @version 0.1.0 – 2026-03-01 23:05
 * @description Серверная валидация Search Profile перед публикацией.
 */

import payloadConfig from '@payload-config'
import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError, getPayload } from 'payload'

import type { SearchProfile } from '@/payload-types'
import { getFacetAttributes } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import { resolveSearchProfile } from '@/RealizeCore/data/searchProfiles/resolveSearchProfile'
import {
  mergeProfileData,
  type ValidationIssue,
} from '@/RealizeCore/collections/Search/validations/shared'
import {
  buildFacetMap,
  validateFacetOverrides,
} from '@/RealizeCore/collections/Search/validations/facetValidations'
import { validateQueryFilters } from '@/RealizeCore/collections/Search/validations/queryFilterValidations'
import { validateComplexity } from '@/RealizeCore/collections/Search/validations/complexityValidation'
import { validateIndexAlias } from '@/RealizeCore/collections/Search/validations/aliasValidation'

export const validateSearchProfileBeforeChange: CollectionBeforeChangeHook<SearchProfile> =
  async ({ data, originalDoc, req }) => {
    const nextStatus = data?._status ?? originalDoc?._status
    const collectionSlug = data?.collectionSlug ?? originalDoc?.collectionSlug

    if (nextStatus !== 'published' || !collectionSlug) {
      return data
    }

    const payloadClient =
      req?.payload ?? (await getPayload({ config: await payloadConfig }))

    const mergedProfile = mergeProfileData(data, originalDoc)

    const facetAttributes = await getFacetAttributes(payloadClient, collectionSlug)
    const facetMap = buildFacetMap(facetAttributes)

    const resolvedProfile = await resolveSearchProfile({
      payload: payloadClient,
      profile: mergedProfile,
    })

    const issues: ValidationIssue[] = [
      ...validateFacetOverrides(mergedProfile, facetMap),
      ...validateQueryFilters(mergedProfile, facetMap),
      ...validateComplexity(mergedProfile, resolvedProfile),
    ]

    const aliasIssue = await validateIndexAlias(mergedProfile)
    if (aliasIssue) {
      issues.push(aliasIssue)
    }

    if (issues.length > 0) {
      throw new ValidationError({
        collection: 'search-profiles',
        errors: issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
        req,
      })
    }

    return data
  }

export default validateSearchProfileBeforeChange
