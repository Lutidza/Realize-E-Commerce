/**
 * @file src/RealizeCore/admin/Fields/SystemFields/urlAliasField/buildUrlAliasPrefillHook.ts
 * @version 1.0.0 – 2025-02-18 22:40
 * @description beforeValidate-хук автоподстановки для urlAlias.
 */

import type { FieldHook } from 'payload'

const hasTextValue = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

/**
 * @param sourceFieldPath Имя поля, из которого следует подставить значение, если alias пуст.
 */
export const buildUrlAliasPrefillHook = (sourceFieldPath: string): FieldHook => {
  const hook: FieldHook = ({ value, siblingData }) => {
    if (hasTextValue(value)) {
      return value
    }

    if (!siblingData || typeof siblingData !== 'object') {
      return value
    }

    const sourceValue = (siblingData as Record<string, unknown>)[sourceFieldPath]

    if (hasTextValue(sourceValue)) {
      return sourceValue
    }

    return value
  }

  return hook
}

export default buildUrlAliasPrefillHook
