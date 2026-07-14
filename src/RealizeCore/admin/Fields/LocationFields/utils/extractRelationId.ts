/**
 * @file src/RealizeCore/admin/Fields/LocationFields/utils/extractRelationId.ts
 * @description Извлекает числовой ID из значения relationship-поля в админке.
 */

export const extractRelationId = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  if (value && typeof value === 'object') {
    if ('id' in (value as Record<string, unknown>)) {
      return extractRelationId((value as Record<string, unknown>).id)
    }

    if ('value' in (value as Record<string, unknown>)) {
      return extractRelationId((value as Record<string, unknown>).value)
    }
  }

  return undefined
}

export default extractRelationId
