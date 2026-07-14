/**
 * @file src/RealizeCore/utils/relations/resolveRelationId.ts
 * @version 1.0.0 – 2026-03-02 14:40
 * @description Универсальная функция для извлечения идентификатора из Payload relation.
 */

export const resolveRelationId = (
  value: number | string | { id?: number | string } | null | undefined,
): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }

  if (value && typeof value === 'object' && 'id' in value) {
    return resolveRelationId(value.id as number | string | undefined)
  }

  return null
}

export default resolveRelationId
