/**
 * @file src/RealizeCore/data/attributes/types.ts
 * @version 1.0.0 – 2024-11-29 03:50
 * Базовые типы для работы с атрибутами в дата-слое Payload.
 * Содержит определения DTO и вспомогательных структур выбора значений.
 */

export type AttributeOption = {
  id: number
  name: string
  slug?: string
  isDefault?: boolean
}

export const SUPPORTED_ATTRIBUTE_TYPES = ['select', 'multiselect', 'text', 'checkbox', 'boolean', 'radio'] as const

export type SupportedAttributeType = (typeof SUPPORTED_ATTRIBUTE_TYPES)[number]

export type AttributeDTO = {
  id: number
  name: string
  type: 'select' | 'multiselect' | 'integer' | 'numberRange' | 'boolean' | 'text' | 'checkbox' | 'radio'
  options: AttributeOption[]
}

export type AttributeSelectionState = {
  selectedValueId?: number | null
  selectedValueIds?: number[]
  selectedTextValue?: string | null
  selectedBooleanValue?: boolean | null
  /**
   * @remarks Используется клиентским полем при сохранении JSON.
   */
  valueIds?: number[]
  /**
   * @remarks Клиентское поле хранит текстовые значения отдельно от selectedTextValue.
   */
  textValue?: string | null
  boolValue?: boolean | null
}

export type AttributeWithValues = AttributeDTO & AttributeSelectionState
export type AttributeSelectionsState = Record<number, AttributeSelectionState>

/**
 * @remarks Проверяет, поддерживает ли UI текущий тип атрибута.
 * @param attribute Атрибут из Payload со значениями.
 * @returns Type guard к поддерживаемым типам.
 */
export const isSupportedAttribute = (
  attribute: AttributeWithValues,
): attribute is AttributeWithValues & { type: SupportedAttributeType } =>
  SUPPORTED_ATTRIBUTE_TYPES.includes(attribute.type as SupportedAttributeType)
