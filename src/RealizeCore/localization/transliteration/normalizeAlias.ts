/**
 * @file src/RealizeCore/localization/transliteration/normalizeAlias.ts
 * @version 1.0.0 – 2025-02-18 22:20
 * @description Нормализация и транслитерация значений alias для SEO-URL.
 */

import { transliterationMaps } from './maps'
import { defaultLocale } from '../index'

const ALIAS_ALLOWED = /[^a-z0-9-]/g
const MULTIPLE_DASHES = /-+/g
const COMBINING_MARKS = /[\u0300-\u036f]/g

const SPECIAL_CHAR_REPLACEMENTS: Record<string, string> = {
  ß: 'ss',
  ı: 'i',
  ł: 'l',
  đ: 'd',
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  þ: 'th',
  ĸ: 'k',
}

const resolveMap = (locale?: string) => {
  if (locale && transliterationMaps[locale]) {
    return transliterationMaps[locale]
  }

  if (transliterationMaps[defaultLocale]) {
    return transliterationMaps[defaultLocale]
  }

  return transliterationMaps.default ?? {}
}

const transliterate = (value: string, locale?: string) => {
  const map = resolveMap(locale)
  const stripped = value.normalize('NFKD').replace(COMBINING_MARKS, '')
  const normalized = stripped
    .split('')
    .map((char) => {
      const replacement = SPECIAL_CHAR_REPLACEMENTS[char] ?? SPECIAL_CHAR_REPLACEMENTS[char.toLowerCase()]
      return replacement ?? char
    })
    .join('')

  return normalized
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()

      if (map[lower]) {
        return map[lower]
      }

      return lower
    })
    .join('')
}

/**
 * @param value Исходное значение поля, которое нужно преобразовать в alias.
 * @param locale Локаль, влияющая на выбор карты транслитерации.
 * @returns Строку в формате [a-z0-9-] без повторяющихся дефисов.
 */
export const normalizeAlias = (value: unknown, locale?: string): string => {
  if (typeof value !== 'string') {
    return ''
  }

  const transliterated = transliterate(value, locale)
  const normalized = transliterated
    .replace(ALIAS_ALLOWED, '-')
    .replace(MULTIPLE_DASHES, '-')
    .replace(/^-+|-+$/g, '')

  return normalized
}

export default normalizeAlias
