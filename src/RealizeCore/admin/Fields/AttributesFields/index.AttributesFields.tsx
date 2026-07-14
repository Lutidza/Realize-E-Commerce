/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/index.AttributesFields.tsx
 * @version 1.1.0 – 2025-02-18 15:15
 * @description Клиентский компонент поля атрибутов для Payload JSON-поля.
 * @remarks Текущая версия подключает загрузку атрибутов и отображает базовый UI.
 */

'use client'

import React from 'react'
import { useDocumentInfo, useField, useLocale } from '@payloadcms/ui'
import type { JSONFieldClientComponent, Locale, Validate } from 'payload'

import type { AttributeSelectionsState, AttributeWithValues } from '@/RealizeCore/data/attributes/types'
import { useAttributesFieldDataHook } from '@/RealizeCore/data/attributes/hooks/useAttributesFieldDataHook'
import { CheckboxAttributeField } from '@/RealizeCore/admin/Fields/AttributesFields/components/CheckboxAttributeField'
import { RadioGroupAttributeField } from '@/RealizeCore/admin/Fields/AttributesFields/components/RadioGroupAttributeField'
import { SelectAttributeField } from '@/RealizeCore/admin/Fields/AttributesFields/components/SelectAttributeField'
import { TextAttributeField } from '@/RealizeCore/admin/Fields/AttributesFields/components/TextAttributeField'
import { useSyncAttributeSelections } from '@/RealizeCore/admin/Fields/AttributesFields/useSyncAttributeSelections'
import { resolveLabel } from '@/RealizeCore/admin/utils/resolveLabel'
import {
  normalizeSelectionsValue,
  normalizeValueIds,
  selectionIsEmpty,
} from '@/RealizeCore/data/attributes/state'
import { isSupportedAttribute } from '@/RealizeCore/data/attributes/types'

type BaseJSONFieldProps = React.ComponentProps<JSONFieldClientComponent>

export type AttributesFieldClientProps = {
  targetCollection?: string
}

export type AttributesFieldProps = BaseJSONFieldProps & AttributesFieldClientProps

/**
 * @param props Свойства поля атрибутов, включая clientProps Payload.
 * @returns React-элемент контейнера поля атрибутов (пока без UI комбинирования).
 */
export const AttributesField: React.FC<AttributesFieldProps> = ({
  path,
  validate,
  field,
  targetCollection,
}) => {
  const locale = useLocale() as Locale | undefined
  const { id: docId, collectionSlug: documentCollection } = useDocumentInfo()

  const { value, setValue, showError, errorMessage } = useField<AttributeSelectionsState>({
    path,
    validate: (validate as Validate | undefined) ?? undefined,
  })

  const selectionState = React.useMemo(() => normalizeSelectionsValue(value), [value])
  const localeCode = locale?.code
  const fieldLabel = resolveLabel(field?.label, field?.name ?? path, localeCode)
  const resolvedCollectionSlug = targetCollection ?? (documentCollection ?? '')

  const { attributes, loading, error } = useAttributesFieldDataHook(resolvedCollectionSlug, docId)
  const supportedAttributes = React.useMemo(
    () => attributes.filter((attribute) => isSupportedAttribute(attribute)),
    [attributes],
  )

  useSyncAttributeSelections({
    attributes: supportedAttributes,
    selectionState,
    setValue,
    docId,
  })

  /**
   * @param attributeId Идентификатор атрибута.
   * @param nextSelection Новое состояние выбора (undefined приводит к удалению ключа).
   */
  const persistSelection = React.useCallback(
    (attributeId: number, nextSelection?: AttributeSelectionsState[number]) => {
      const nextState: AttributeSelectionsState = { ...selectionState }

      if (!nextSelection || selectionIsEmpty(nextSelection)) {
        delete nextState[attributeId]
      } else {
        nextState[attributeId] = nextSelection
      }

      setValue(nextState)
    },
    [selectionState, setValue],
  )

  /**
   * @param attributeId Идентификатор атрибута.
   * @param rawValue Значение селекта (строка или массив строк).
   */
  const handleSelectChange = React.useCallback(
    (attributeId: number, rawValue?: string | string[]) => {
      const numericValueIds = normalizeValueIds(rawValue)

      if (numericValueIds.length === 0) {
        persistSelection(attributeId)
        return
      }

      persistSelection(attributeId, { valueIds: numericValueIds })
    },
    [persistSelection],
  )

  /**
   * @param attributeId Идентификатор текстового атрибута.
   * @param textValue Введённое пользователем значение.
   */
  const handleTextChange = React.useCallback(
    (attributeId: number, textValue?: string) => {
      if (!textValue || textValue.trim().length === 0) {
        persistSelection(attributeId)
        return
      }

      persistSelection(attributeId, { textValue })
    },
    [persistSelection],
  )

  /**
   * @param attributeId Идентификатор атрибута-чекбокса.
   * @param nextValue Новое значение чекбокса.
   */
  const handleCheckboxChange = React.useCallback(
    (attributeId: number, nextValue?: boolean) => {
      if (typeof nextValue !== 'boolean') {
        persistSelection(attributeId)
        return
      }

      persistSelection(attributeId, { boolValue: nextValue })
    },
    [persistSelection],
  )

  /**
   * @param attribute Визуализируемый атрибут.
   * @returns React-элемент конкретного поля.
   */
  const renderAttributeField = React.useCallback(
    (attribute: AttributeWithValues) => {
      const currentSelection = selectionState[attribute.id]

      if (attribute.type === 'text') {
        return (
          <TextAttributeField
            key={attribute.id}
            attribute={attribute}
            value={currentSelection?.textValue ?? ''}
            onChangeAction={(nextValue) => handleTextChange(attribute.id, nextValue)}
          />
        )
      }

      if (attribute.type === 'radio') {
        const currentValue =
          currentSelection?.valueIds && currentSelection.valueIds.length > 0
            ? String(currentSelection.valueIds[0])
            : attribute.selectedValueId
              ? String(attribute.selectedValueId)
              : undefined

        return (
          <RadioGroupAttributeField
            key={attribute.id}
            attribute={attribute}
            value={currentValue}
            onChangeAction={(nextValue) => handleSelectChange(attribute.id, nextValue)}
          />
        )
      }

      if (attribute.type === 'checkbox' || attribute.type === 'boolean') {
        const boolValue =
          typeof currentSelection?.boolValue === 'boolean'
            ? currentSelection.boolValue
            : attribute.selectedBooleanValue ?? false

        return (
          <CheckboxAttributeField
            key={attribute.id}
            attribute={attribute}
            value={boolValue}
            onChangeAction={(nextValue) => handleCheckboxChange(attribute.id, nextValue)}
          />
        )
      }

      const hasMany = attribute.type === 'multiselect'
      const currentValue = hasMany
        ? (currentSelection?.valueIds ?? []).map((valueId) => String(valueId))
        : currentSelection?.valueIds && currentSelection.valueIds.length > 0
          ? String(currentSelection.valueIds[0])
          : undefined

      return (
        <SelectAttributeField
          key={attribute.id}
          attribute={attribute}
          value={currentValue}
          onChangeAction={(nextValue) => handleSelectChange(attribute.id, nextValue)}
        />
      )
    },
    [handleCheckboxChange, handleSelectChange, handleTextChange, selectionState],
  )

  const shouldShowEmptyState = !loading && supportedAttributes.length === 0 && resolvedCollectionSlug.length > 0

  return (
    <div className="attributes-field render-fields document-fields__fields" data-field-path={path}>
      <h4 className="text-md font-medium mb-4">{fieldLabel}</h4>
      {!resolvedCollectionSlug ? (
        <p className="text-destructive text-xs mt-2">
          Не задана коллекция для загрузки атрибутов (clientProps.targetCollection).
        </p>
      ) : null}
      {loading ? <p className="text-xs text-muted-foreground mt-2">Загрузка атрибутов…</p> : null}
      {error ? (
        <p className="text-destructive text-xs mt-2" role="alert">
          {error}
        </p>
      ) : null}
      {shouldShowEmptyState ? (
        <p className="text-xs text-muted-foreground mt-2">Для коллекции не найдены активные атрибуты.</p>
      ) : null}

      {supportedAttributes.map((attribute) => (
        <div key={attribute.id} className="field-type mb-4" >
          {renderAttributeField(attribute)}
        </div>
      ))}

      {showError && errorMessage ? (
        <p className="text-destructive text-sm mt-2" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export default AttributesField
