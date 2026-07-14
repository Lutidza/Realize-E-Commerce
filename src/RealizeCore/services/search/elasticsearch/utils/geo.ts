/**
 * @file src/RealizeCore/services/search/elasticsearch/utils/geo.ts
 * @version 0.1.0 – 2026-03-01 12:40
 * @description Нормализация геометрии для индекса.
 */

type MaybeGeo = {
  lat?: number
  lon?: number
  latitude?: number
  longitude?: number
  coordinates?: [number, number]
}

export const resolveGeoPoint = (value: MaybeGeo | null | undefined) => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  if (Array.isArray(value.coordinates) && value.coordinates.length === 2) {
    const [lon, lat] = value.coordinates
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon }
    }
  }

  const lat =
    typeof value.lat === 'number'
      ? value.lat
      : typeof value.latitude === 'number'
        ? value.latitude
        : undefined
  const lon =
    typeof value.lon === 'number'
      ? value.lon
      : typeof value.longitude === 'number'
        ? value.longitude
        : undefined

  if (typeof lat === 'number' && typeof lon === 'number') {
    return { lat, lon }
  }

  return undefined
}

export default resolveGeoPoint
