/**
 * @file src/RealizeCore/data/attributes/state/utils/isSelectionsStateEmpty.ts
 * @version 1.0.0 – 2025-02-18 16:05
 * @description Проверка наличия данных в JSON-состоянии атрибутов.
 */

import type { AttributeSelectionsState } from '@/RealizeCore/data/attributes/types'

const selectionHasValues = (selection?: AttributeSelectionsState[number]) => {
  if (!selection) {
    return false
  }

  const hasIds = Array.isArray(selection.valueIds) && selection.valueIds.some((value) => Number.isFinite(value))
  const hasText = typeof selection.textValue === 'string' && selection.textValue.trim().length > 0
  const hasBool = typeof selection.boolValue === 'boolean'

  return hasIds || hasText || hasBool
}

/**
 * @param selections Состояние JSON-поля attributeSelectionsData.
 * @returns Признак наличия хотя бы одного значения.
 */
export const isSelectionsStateEmpty = (selections?: AttributeSelectionsState) => {
  if (!selections) {
    return true
  }

  return !Object.values(selections).some((selection) => selectionHasValues(selection))
}

export default isSelectionsStateEmpty
