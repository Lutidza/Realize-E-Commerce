/**
 * @file src/RealizeCore/collections/Listings/hooks/createEnsureGeoHook.ts
 * @version 1.3.0 – 2025-02-25 20:40
 * @description beforeValidate-хук для Listings: нормализует поля municipality/city/route без geo-группы.
 */

import type { CollectionBeforeValidateHook, Payload } from 'payload'

import type { AdministrativeArea, Listing, Route } from '@/payload-types'

type AdministrativeAreaDoc = Pick<
  AdministrativeArea,
  'id' | 'level' | 'parent' | 'slug' | 'urlAlias' | 'title'
>

type RouteDoc = Pick<Route, 'id' | 'administrativeArea' | 'city'>

type ListingLocationFields = Pick<Listing, 'administrativeArea' | 'city' | 'route'>

const ADMINISTRATIVE_AREAS_COLLECTION = 'administrative-areas' as const
const ROUTES_COLLECTION = 'routes' as const

const allowedCityLevels = new Set<AdministrativeArea['level']>(['locality'])
const allowedMunicipalityLevels = new Set<AdministrativeArea['level']>(['admin_area_level_2'])

const extractRelationId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  if (
    value &&
    typeof value === 'object' &&
    'id' in (value as Record<string, unknown>) &&
    (value as Record<string, unknown>).id
  ) {
    return extractRelationId((value as Record<string, unknown>).id)
  }

  return undefined
}

const loadAdministrativeArea = async (
  payloadClient: Payload,
  id: number,
): Promise<AdministrativeAreaDoc | undefined> => {
  try {
    const raw = (await payloadClient.findByID({
      collection: ADMINISTRATIVE_AREAS_COLLECTION as never,
      id,
      depth: 0,
    })) as AdministrativeArea

    return {
      id: raw.id,
      level: raw.level,
      parent: raw.parent,
      slug: raw.slug ?? null,
      urlAlias: raw.urlAlias ?? null,
      title: raw.title ?? null,
    }
  } catch {
    return undefined
  }
}

const loadRoute = async (
  payloadClient: Payload,
  id: number,
): Promise<RouteDoc | undefined> => {
  try {
    const raw = (await payloadClient.findByID({
      collection: ROUTES_COLLECTION as never,
      id,
      depth: 0,
    })) as Route

    return {
      id: raw.id,
      administrativeArea: raw.administrativeArea,
      city: raw.city,
    }
  } catch {
    return undefined
  }
}

const collectAreaChain = async (
  payloadClient: Payload,
  startId: number | undefined,
): Promise<AdministrativeAreaDoc[]> => {
  if (!startId) {
    return []
  }

  const chain: AdministrativeAreaDoc[] = []
  const visited = new Set<number>()
  let cursor: number | undefined = startId

  while (cursor && !visited.has(cursor)) {
    visited.add(cursor)
    const area = await loadAdministrativeArea(payloadClient, cursor)

    if (!area) {
      break
    }

    chain.push(area)
    cursor = extractRelationId(area.parent)
  }

  return chain
}

export const createEnsureGeoHook = (): CollectionBeforeValidateHook => {
  const hook: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
    if (!data) {
      return data
    }

    const payloadClient = req.payload
    if (!payloadClient) {
      return data
    }

    const incomingGeo = data as ListingLocationFields
    const previousGeo = (originalDoc ?? {}) as ListingLocationFields

    const routeId = extractRelationId(incomingGeo.route ?? previousGeo?.route)
    const routeDoc = routeId ? await loadRoute(payloadClient, routeId) : undefined

    if (routeId && !routeDoc) {
      throw new Error(`[geo] Route #${routeId} не найден`)
    }

    const routeStartAreaId = routeDoc
      ? (extractRelationId(routeDoc.city) ?? extractRelationId(routeDoc.administrativeArea))
      : undefined
    const routeHierarchy =
      routeStartAreaId !== undefined
        ? await collectAreaChain(payloadClient, routeStartAreaId)
        : []
    const inferredCityFromRoute = routeHierarchy.find((area) => area.level === 'locality')

    const cityId = extractRelationId(incomingGeo.city ?? previousGeo?.city ?? inferredCityFromRoute?.id)

    if (typeof cityId !== 'number') {
      throw new Error('[geo] Требуется выбрать город уровня locality')
    }

    const cityArea = await loadAdministrativeArea(payloadClient, cityId)

    if (!cityArea) {
      throw new Error(`[geo] Город #${cityId} не найден`)
    }

    if (!allowedCityLevels.has(cityArea.level)) {
      throw new Error(`[geo] Administrative area #${cityArea.id} имеет неподдерживаемый level ${cityArea.level}`)
    }

    if (
      inferredCityFromRoute &&
      extractRelationId(inferredCityFromRoute.id) &&
      extractRelationId(inferredCityFromRoute.id) !== extractRelationId(cityArea.id)
    ) {
      throw new Error('[geo] Маршрут принадлежит другому городу, выберите корректную пару city/route')
    }

    const cityParentId = extractRelationId(cityArea.parent)
    const hierarchy =
      routeStartAreaId !== undefined
        ? routeHierarchy
        : await collectAreaChain(payloadClient, cityParentId)

    const incomingMunicipalityId = extractRelationId(
      incomingGeo.administrativeArea ?? previousGeo?.administrativeArea,
    )
    const inferredMunicipality =
      hierarchy.find((area) => area.level === 'admin_area_level_2') ??
      (cityParentId ? await loadAdministrativeArea(payloadClient, cityParentId) : undefined)

    let resolvedMunicipalityId: number | null = null

    if (typeof incomingMunicipalityId === 'number') {
      const municipalityArea = await loadAdministrativeArea(payloadClient, incomingMunicipalityId)

      if (!municipalityArea) {
        throw new Error(`[geo] Муниципалитет #${incomingMunicipalityId} не найден`)
      }

      if (!allowedMunicipalityLevels.has(municipalityArea.level)) {
        throw new Error(
          `[geo] Administrative area #${municipalityArea.id} имеет неподдерживаемый level ${municipalityArea.level}`,
        )
      }

      resolvedMunicipalityId = incomingMunicipalityId
    } else if (inferredMunicipality) {
      const inferredId = extractRelationId(inferredMunicipality.id)
      resolvedMunicipalityId = typeof inferredId === 'number' ? inferredId : null
    }

    if (
      resolvedMunicipalityId &&
      inferredMunicipality &&
      extractRelationId(inferredMunicipality.id) &&
      resolvedMunicipalityId !== extractRelationId(inferredMunicipality.id)
    ) {
      throw new Error('[geo] Муниципалитет не соответствует выбранному городу')
    }

    if (routeId && cityId) {
      const routeCityId = inferredCityFromRoute ? extractRelationId(inferredCityFromRoute.id) : undefined
      if (routeCityId && routeCityId !== cityId) {
        throw new Error('[geo] Маршрут принадлежит другому городу, выберите корректную пару city/route')
      }
    }

    data.administrativeArea = resolvedMunicipalityId ?? null
    data.city = cityId
    data.route = routeId ?? null

    return data
  }

  return hook
}

export default createEnsureGeoHook
