/**
 * @file src/RealizeCore/routes/srp/createSearchRoute.ts
 * @version 0.1.0 – 2026-03-02 18:05
 * @description Универсальные парсеры/билдеры маршрутов SRP на базе Search Profile.
 */

import { defaultLocale as fallbackLocale } from '@/RealizeCore/localization'

import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import { getFacetDictionary } from '@/RealizeCore/routes/shared/facets'
import { createRouteParser } from './createRouteParser'
import { createRouteBuilder } from './createRouteBuilder'
import type { RouteParserContext } from './createRouteParser'

const ensureCollectionSlug = (profile: ResolvedSearchProfile | null) => {
  if (!profile?.collectionSlug || profile.collectionSlug.length === 0) {
    throw new Error('ResolvedSearchProfile.collectionSlug is required for SRP routes')
  }

  return profile.collectionSlug
}

type RouteDependencies = {
  getDictionary?: RouteParserContext['fetchDictionary']
  defaultLocale?: string
}

export const createSearchRoute = (
  profile: ResolvedSearchProfile | null,
  dependencies: RouteDependencies = {},
) => {
  const collectionSlug = ensureCollectionSlug(profile)
  const defaultLocale = dependencies.defaultLocale ?? fallbackLocale

  const parser = createRouteParser({
    collectionSlug,
    defaultLocale,
    fetchDictionary: dependencies.getDictionary ?? getFacetDictionary,
  })
  const builder = createRouteBuilder({
    collectionSlug,
    defaultLocale,
  })

  return {
    parseSegments: parser.parseSegments,
    parsePath: parser.parsePath,
    buildPath: builder.buildPath,
  }
}

export default createSearchRoute
