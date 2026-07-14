/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/components/CheckboxAttributeField.tsx
 * @version 1.0.0 – 2025-02-18 18:05
 * @description Чекбокс для boolean/checkbox атрибутов.
 */

'use client'

import React from 'react'
import { CheckboxInput } from '@payloadcms/ui/fields/Checkbox'

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

export type CheckboxAttributeFieldProps = {
  attribute: AttributeWithValues
  value?: boolean | null
  onChangeAction: (value?: boolean) => void
}

/**
 * @param props Свойства чекбокса атрибута.
 */
export const CheckboxAttributeField: React.FC<CheckboxAttributeFieldProps> = ({
  attribute,
  value,
  onChangeAction,
}) => (
  <CheckboxInput
    id={`attribute-${attribute.id}`}
    label={attribute.name}
    checked={Boolean(value)}
    onToggle={(event) => onChangeAction(event.target.checked)}
  />
)

export default CheckboxAttributeField
