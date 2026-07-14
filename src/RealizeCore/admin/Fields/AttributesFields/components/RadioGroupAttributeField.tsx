/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/components/RadioGroupAttributeField.tsx
 * @version 1.0.0 – 2025-02-18 18:50
 * @description Radio group field для radio-атрибутов, использует стандартный компонент Payload.
 */

'use client'

import React from 'react'
import { useForm } from '@payloadcms/ui'
import { Radio } from '@payloadcms/ui/fields/RadioGroup/Radio'

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

export type RadioGroupAttributeFieldProps = {
  attribute: AttributeWithValues
  value?: string
  onChangeAction: (value?: string) => void
}

/**
 * @param props Свойства радио-группы атрибута.
 */
export const RadioGroupAttributeField: React.FC<RadioGroupAttributeFieldProps> = ({
  attribute,
  value,
  onChangeAction,
}) => {
  const defaultValue = React.useMemo(() => {
    const defaultOption = attribute.options.find((option) => option.isDefault)
    return defaultOption ? String(defaultOption.id) : undefined
  }, [attribute.options])

  React.useEffect(() => {
    if (!value && defaultValue) {
      onChangeAction(defaultValue)
    }
  }, [defaultValue, onChangeAction, value])

  const path = `attribute-${attribute.id}`
  const { uuid } = useForm()
  const currentValue = value ?? defaultValue ?? ''

  return (
    <fieldset className="attributes-field__radio">
      <legend id={`${path}-legend`} className="text-sm font-medium mb-2">
        {attribute.name}
      </legend>
      <div className="flex flex-wrap gap-4" role="radiogroup" aria-labelledby={`${path}-legend`}>
        {attribute.options.map((option) => {
          const optionValue = String(option.id)
          const isSelected = currentValue === optionValue
          return (
            <Radio
              key={`${path}-${optionValue}`}
              id={`${path}-${optionValue}${uuid ? `-${uuid}` : ''}`}
              isSelected={isSelected}
              onChange={() => onChangeAction(optionValue)}
              option={{ label: option.name, value: optionValue }}
              path={path}
              readOnly={false}
              uuid={uuid}
            />
          )
        })}
      </div>
    </fieldset>
  )
}

export default RadioGroupAttributeField
