/**
 * @file src/RealizeCore/data/attributes/state/utils/buildSelectionStateFromAttributes.ts
 * @version 1.0.0 – 2025-02-18 16:05
 * @description Формирование состояния JSON-поля атрибутов из ответа Payload.
 */

import type {
  AttributeSelectionsState,
  AttributeSelectionState,
  AttributeWithValues,
} from '@/RealizeCore/data/attributes/types'

/**
 * @remarks Поддерживаются только текстовые и select-типы, соответствующие UI.
 * @param attribute Атрибут с данными о выбранных значениях.
 * @returns Структура состояния для JSON-поля.
 */
const buildSelectionEntry = (
  attribute: AttributeWithValues,
): AttributeSelectionState | undefined => {
  if (attribute.type === 'text') {
    const textValue = typeof attribute.selectedTextValue === 'string' ? attribute.selectedTextValue : null

    if (!textValue || textValue.trim().length === 0) {
      return undefined
    }

    return { textValue }
  }

  if (attribute.type === 'checkbox' || attribute.type === 'boolean') {
    if (typeof attribute.selectedBooleanValue === 'boolean') {
      return { boolValue: attribute.selectedBooleanValue }
    }

    return undefined
  }

  const hasMany = attribute.type === 'multiselect'
  const baseValues = hasMany
    ? attribute.selectedValueIds ?? []
    : typeof attribute.selectedValueId === 'number' && Number.isFinite(attribute.selectedValueId)
      ? [attribute.selectedValueId]
      : []

  const normalized = baseValues.filter(
    (value) => typeof value === 'number' && Number.isFinite(value),
  )

  if (normalized.length === 0) {
    return undefined
  }

  return { valueIds: normalized }
}

/**
 * @param attributes Список атрибутов с выбранными значениями.
 * @returns JSON-структура для поля attributeSelectionsData.
 */
export const buildSelectionStateFromAttributes = (
  attributes: AttributeWithValues[],
): AttributeSelectionsState =>
  attributes.reduce<AttributeSelectionsState>((acc, attribute) => {
    const entry = buildSelectionEntry(attribute)

    if (entry) {
      acc[attribute.id] = entry
    }

    return acc
  }, {})

export default buildSelectionStateFromAttributes
