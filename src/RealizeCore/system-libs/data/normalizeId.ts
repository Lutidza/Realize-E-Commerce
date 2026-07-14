/**
 * @file src/RealizeCore/system-libs/data/normalizeId.ts
 * @version 1.0.0 – 2025-02-23 22:55
 * @description Универсальная утилита для приведения значений ID к числу.
 */

/**
 * @param value Произвольное значение (число, строка, объект с полем id).
 * @returns Числовой идентификатор или undefined, если привести нельзя.
 */
export const normalizeId = (value: unknown): number | undefined => {
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
    return normalizeId((value as Record<string, unknown>).id)
  }

  return undefined
}

export default normalizeId
