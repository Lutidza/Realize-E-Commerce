/**
 * @file src/RealizeCore/services/search/elasticsearch/utils/attributeSelections.ts
 * @version 0.1.0 – 2026-03-01 12:35
 * @description Нормализация attributeSelectionsData для индексации.
 */

export type RawSelections =
  | string
  | number
  | boolean
  | unknown[]
  | Record<string, unknown>

export type NormalizedSelections = Record<
  number,
  {
    valueIds: number[]
  }
>

const normalizeNumeric = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }

  return null
}

type RawSelectionEntry = {
  valueIds?: Array<number | string>
  valueId?: number | string
}

const isRawSelectionEntry = (value: unknown): value is RawSelectionEntry =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

const parseSelectionsObject = (input: unknown): NormalizedSelections => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {}
  }

  return Object.entries(input as Record<string, unknown>).reduce<NormalizedSelections>((acc, [key, entry]) => {
    const attributeId = normalizeNumeric(key)
    if (!attributeId || !isRawSelectionEntry(entry)) {
      return acc
    }

    const rawIds = Array.isArray(entry?.valueIds)
      ? entry?.valueIds
      : entry?.valueId
        ? [entry.valueId]
        : []

    const normalizedIds = rawIds
      .map((value: number | string) => normalizeNumeric(value))
      .filter((value): value is number => typeof value === 'number')

    if (normalizedIds.length === 0) {
      return acc
    }

    acc[attributeId] = {
      valueIds: normalizedIds,
    }

    return acc
  }, {})
}

export const normalizeAttributeSelections = (
  input: unknown,
): NormalizedSelections => {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input) as unknown
      return parseSelectionsObject(parsed)
    } catch {
      return {}
    }
  }

  return parseSelectionsObject(input ?? {})
}
