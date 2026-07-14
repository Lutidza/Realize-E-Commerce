/**
 * @file src/RealizeCore/routes/listings/index.ts
 * @version 1.0.0 – 2025-02-18 23:10
 * @description Точка входа маршрутов карточек объявлений.
 */

export { parseListingPath, parseListingSegments } from './parseListingPath'
export { logListingRoute, logListingError } from './debug'
export type {
  ListingRouteGeo,
  ListingRouteFacet,
  ListingRouteMatch,
  ListingRouteParseOptions,
  ListingRouteParseResult,
} from './types'
