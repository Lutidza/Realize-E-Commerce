/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/utils/selectDefaultUtils.ts
 * @version 1.0.0 – 2025-02-18 19:30
 * @description Утилиты нормализации select/multiselect значений с учётом defaults.
 */

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

/**
 * @param attribute Атрибут с опциями.
 * @returns Строка идентификатора значения по умолчанию (для одиночных selects).
 */
export const getDefaultSingleOption = (attribute: AttributeWithValues) => {
  const defaultOption = attribute.options.find((option) => option.isDefault)
  return defaultOption ? String(defaultOption.id) : undefined
}

/**
 * @param attribute Атрибут (multiselect).
 * @returns Список строковых id значений по умолчанию.
 */
export const getDefaultMultiOptions = (attribute: AttributeWithValues) =>
  attribute.options.filter((option) => option.isDefault).map((option) => String(option.id))

/**
 * @param attribute Атрибут select/multiselect.
 * @param value Текущее значение React-компонента.
 * @returns Нормализованное значение для SelectInput.
 */
export const normalizeSelectValue = (attribute: AttributeWithValues, value?: string | string[]) => {
  const hasMany = attribute.type === 'multiselect'

  const defaultSingle = getDefaultSingleOption(attribute)
  const defaultMulti = getDefaultMultiOptions(attribute)

  if (hasMany) {
    if (Array.isArray(value) && value.length > 0) {
      return value
    }
    return defaultMulti
  }

  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  return defaultSingle ?? ''
}
