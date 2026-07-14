/**
 * @file src/RealizeCore/routes/srp/helpers/routeErrorsHelper.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Общие хелперы формирования ошибок SRP-маршрутов.
 */

import type { SrpRouteParseErrorReason, SrpRouteParseResult } from '../srpRoutes.types'

export const buildRouteError = (
  reason: SrpRouteParseErrorReason,
  details?: Record<string, unknown>,
): SrpRouteParseResult => ({
  ok: false as const,
  reason,
  ...(details ? { details } : {}),
})

export default buildRouteError
