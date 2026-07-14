/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/components/SelectAttributeField.tsx
 * @version 1.0.0 – 2024-11-29 03:50
 * Компонент выбора значения для select/multiselect атрибутов.
 */

'use client'

import React from 'react'
import { SelectInput } from '@payloadcms/ui/fields/Select'

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'
import {
  getDefaultMultiOptions,
  getDefaultSingleOption,
  normalizeSelectValue,
} from '@/RealizeCore/admin/Fields/AttributesFields/utils/selectDefaultUtils'

export type SelectAttributeFieldProps = {
  attribute: AttributeWithValues
  value?: string | string[]
  onChangeAction: (value?: string | string[]) => void
}

/**
 * @param props Свойства компонента select-атрибута.
 */
export const SelectAttributeField: React.FC<SelectAttributeFieldProps> = ({ attribute, value, onChangeAction }) => {
  const hasMany = attribute.type === 'multiselect'

  const defaultSingleValue = React.useMemo(
    () => (!hasMany ? getDefaultSingleOption(attribute) : undefined),
    [attribute, hasMany],
  )

  const defaultMultiValues = React.useMemo(
    () => (hasMany ? getDefaultMultiOptions(attribute) : []),
    [attribute, hasMany],
  )

  const normalizedValue = React.useMemo(
    () => normalizeSelectValue(attribute, value),
    [attribute, value],
  )

  React.useEffect(() => {
    if (hasMany) {
      if ((!Array.isArray(value) || value.length === 0) && defaultMultiValues.length > 0) {
        onChangeAction(defaultMultiValues)
      }
      return
    }

    if ((value === undefined || value === null || value === '') && defaultSingleValue) {
      onChangeAction(defaultSingleValue)
    }
  }, [defaultMultiValues, defaultSingleValue, hasMany, onChangeAction, value])

  const options = attribute.options.map((option) => ({
    label: option.name,
    value: String(option.id),
  }))

  return (
    <SelectInput
      name={`attribute-${attribute.id}`}
      path={`attribute-${attribute.id}`}
      label={attribute.name}
      hasMany={hasMany}
      options={options}
      value={normalizedValue}
      onChange={(selected) => {
        if (Array.isArray(selected)) {
          onChangeAction(selected.map((option) => String(option.value)))
          return
        }

        onChangeAction(selected?.value ? String(selected.value) : undefined)
      }}
    />
  )
}

export default SelectAttributeField
