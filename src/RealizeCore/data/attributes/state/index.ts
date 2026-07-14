/**
 * @file src/RealizeCore/data/attributes/state/index.ts
 * @version 1.0.0 – 2025-02-18 15:45
 * @description Утилиты преобразования и валидации состояния выборов атрибутов.
 */

import type { AttributeSelectionsState, AttributeWithValues } from '@/RealizeCore/data/attributes/types'
import { buildSelectionStateFromAttributes as buildSelectionStateFromAttributesImpl } from '@/RealizeCore/data/attributes/state/utils/buildSelectionStateFromAttributes'
import { isSelectionsStateEmpty as isSelectionsStateEmptyImpl } from '@/RealizeCore/data/attributes/state/utils/isSelectionsStateEmpty'
import { areSelectionsEqual as areSelectionsEqualImpl } from '@/RealizeCore/data/attributes/state/utils/areSelectionsEqual'

/**
 * @remarks Используется при чтении значения JSON-поля Payload.
 * @param value Исходное значение из формы Payload (любой тип).
 * @returns Корректный объект состояний атрибутов.
 */
export const normalizeSelectionsValue = (value: unknown): AttributeSelectionsState => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as AttributeSelectionsState
  }

  return {}
}

/**
 * @remarks Преобразует строковые значения SelectInput в числовые идентификаторы.
 * @param value Строка или массив строк из UI.
 * @returns Массив числовых идентификаторов.
 */
export const normalizeValueIds = (value?: string | string[]) => {
  const sourceValues = Array.isArray(value) ? value : value ? [value] : []

  return sourceValues
    .map((item) => Number(item))
    .filter((numericValue) => Number.isFinite(numericValue))
}

/**
 * @remarks Определяет, содержит ли состояние хоть какие-то значения.
 * @param selection Запись о конкретном атрибуте.
 * @returns true если нет значений/текстов, false если есть полезные данные.
 */
export const selectionIsEmpty = (selection?: AttributeSelectionsState[number]) => {
  if (!selection) {
    return true
  }

  const hasValues = Array.isArray(selection.valueIds) && selection.valueIds.length > 0
  const hasText = typeof selection.textValue === 'string' && selection.textValue.trim().length > 0
  const hasBool = typeof selection.boolValue === 'boolean'

  return !hasValues && !hasText && !hasBool
}

/**
 * @param attributes Список атрибутов с исходными значениями.
 * @returns Состояние JSON для поля attributeSelectionsData.
 */
export const buildSelectionStateFromAttributes = (attributes: AttributeWithValues[]) =>
  buildSelectionStateFromAttributesImpl(attributes)

/**
 * @param selections Текущее состояние поля.
 * @returns true, если состояние не содержит значений/текстов.
 */
export const isSelectionsStateEmpty = (selections?: AttributeSelectionsState) =>
  isSelectionsStateEmptyImpl(selections)

/**
 * @param next Следующее состояние.
 * @param prev Предыдущее состояние.
 * @returns true, если состояния эквивалентны.
 */
export const areSelectionsEqual = (
  next?: AttributeSelectionsState,
  prev?: AttributeSelectionsState,
) => areSelectionsEqualImpl(next, prev)

export default {
  normalizeSelectionsValue,
  normalizeValueIds,
  selectionIsEmpty,
  buildSelectionStateFromAttributes,
  isSelectionsStateEmpty,
  areSelectionsEqual,
}
