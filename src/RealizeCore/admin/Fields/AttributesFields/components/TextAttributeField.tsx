/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/components/TextAttributeField.tsx
 * @version 1.1.0 – 2025-02-18 16:40
 * Компонент редактирования текстовых атрибутов.
 */

'use client'

import React from 'react'
import type { ChangeEvent } from 'react'
import { TextInput } from '@payloadcms/ui/fields/Text'

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

export type TextAttributeFieldProps = {
  attribute: AttributeWithValues
  value?: string
  onChangeAction: (value?: string) => void
}

/**
 * @param props Свойства текстового поля атрибута.
 */
export const TextAttributeField: React.FC<TextAttributeFieldProps> = ({ attribute, value, onChangeAction }) => (
  <TextInput
    path={`attribute-${attribute.id}`}
    label={attribute.name}
    value={value ?? ''}
    onChange={(event: ChangeEvent<HTMLInputElement>) => onChangeAction(event.target.value || undefined)}
  />
)

export default TextAttributeField
