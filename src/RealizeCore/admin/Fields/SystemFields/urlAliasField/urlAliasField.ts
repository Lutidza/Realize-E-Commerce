/**
 * @file src/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField.ts
 * @version 1.4.1 – 2025-02-18 22:40
 * @description Текстовое поле urlAlias с автоподстановкой и транслитерацией.
 */

import type { Field, FieldHook } from 'payload'

import { defaultLocale } from '@/RealizeCore/localization'
import { normalizeAlias } from '@/RealizeCore/localization/transliteration/normalizeAlias'

import { buildUrlAliasPrefillHook } from './buildUrlAliasPrefillHook'

const normalizeAliasHook: FieldHook = ({ value, req }) => {
  if (typeof value !== 'string') {
    return value
  }

  const locale =
    (req?.locale as string | undefined) ??
    (req?.context && typeof req.context === 'object'
      ? ((req.context as Record<string, unknown>).locale as string | undefined)
      : undefined) ??
    defaultLocale

  return normalizeAlias(value, locale)
}

export type UrlAliasFieldOptions = {
  /**
   * Имя поля, из которого подставляется значение (обязательно).
   */
  sourceFieldPath: string
}

const urlAliasField = ({ sourceFieldPath }: UrlAliasFieldOptions): Field => ({
  name: 'urlAlias',
  label: 'URL alias',
  type: 'text',
  localized: true,
  unique: true,
  required: false,
  hooks: {
    beforeValidate: [buildUrlAliasPrefillHook(sourceFieldPath), normalizeAliasHook],
  },
  admin: {
    description: 'Localized alias used in SEO URLs.',
  },
})

export default urlAliasField
