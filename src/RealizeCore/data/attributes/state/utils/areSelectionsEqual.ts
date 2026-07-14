/**
 * @file src/RealizeCore/data/attributes/state/utils/areSelectionsEqual.ts
 * @version 1.0.0 – 2025-02-18 16:05
 * @description Сравнение двух состояний выборов атрибутов.
 */

import type { AttributeSelectionsState } from '@/RealizeCore/data/attributes/types'

type NormalizedSelection = {
  textValue: string
  valueIds: number[]
  boolValue: boolean | null
}

const normalizeSelection = (selection?: AttributeSelectionsState[number]): NormalizedSelection => {
  const textValue =
    typeof selection?.textValue === 'string' ? selection.textValue.trim() : ''

  const valueIds = Array.isArray(selection?.valueIds)
    ? selection.valueIds
        .filter((value) => Number.isFinite(value))
        .map((value) => Number(value))
        .sort((a, b) => a - b)
    : []

  const boolValue =
    typeof selection?.boolValue === 'boolean' ? selection.boolValue : null

  return { textValue, valueIds, boolValue }
}

const compareSelections = (left: NormalizedSelection, right: NormalizedSelection) => {
  if (left.textValue !== right.textValue) {
    return false
  }

  if (left.valueIds.length !== right.valueIds.length) {
    return false
  }

  if (!left.valueIds.every((value, index) => value === right.valueIds[index])) {
    return false
  }

  return left.boolValue === right.boolValue
}

/**
 * @param left Первое состояние выбора атрибутов.
 * @param right Второе состояние выбора атрибутов.
 * @returns true, если структуры эквивалентны.
 */
export const areSelectionsEqual = (
  left?: AttributeSelectionsState,
  right?: AttributeSelectionsState,
) => {
  const leftState = left ?? {}
  const rightState = right ?? {}

  const leftKeys = Object.keys(leftState)
  const rightKeys = Object.keys(rightState)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(rightState, key)) {
      return false
    }

    const numericKey = Number(key)
    const leftSelection = normalizeSelection(leftState[numericKey])
    const rightSelection = normalizeSelection(rightState[numericKey])

    return compareSelections(leftSelection, rightSelection)
  })
}

export default areSelectionsEqual
