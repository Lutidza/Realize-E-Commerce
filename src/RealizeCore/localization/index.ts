/**
 * @file src/RealizeCore/localization/index.ts
 * @version 1.1.0 – 2025-02-25 19:40
 * @description
 * Публичное API локализации: список поддерживаемых локалей, утилиты и флаги RTL.
 */

import type { TypedLocale } from 'payload'

import { getOgLocale, localizationSettings } from './config'

export { getOgLocale, localizationSettings }

export type PayloadLocale = TypedLocale

const resolvedLocales = localizationSettings.locales as PayloadLocale[]
const rtlLocales = new Set<PayloadLocale>(
  localizationSettings.payloadLocales
    .filter((locale) => locale.rtl)
    .map((locale) => locale.code as PayloadLocale),
)

export const supportedLocales: PayloadLocale[] = [...resolvedLocales]
export const defaultLocale = localizationSettings.defaultLocale as PayloadLocale
export const fallbackLocale = localizationSettings.fallbackLocale as PayloadLocale
export const nonDefaultLocales = supportedLocales.filter((locale) => locale !== defaultLocale)

export const isSupportedLocale = (value: string): value is PayloadLocale =>
  supportedLocales.includes(value as PayloadLocale)

export const isDefaultLocale = (value: string): boolean => value === defaultLocale

export const normalizeLocale = (value: string): PayloadLocale =>
  (isSupportedLocale(value) ? (value as PayloadLocale) : fallbackLocale)

export const isRtlLocale = (value: string): boolean => rtlLocales.has(value as PayloadLocale)

export const getLocaleDirection = (value: string): 'rtl' | 'ltr' =>
  isRtlLocale(value) ? 'rtl' : 'ltr'

const ensureLeadingSlash = (path: string): string => {
  if (!path || path === '/') {
    return '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

export const formatLocalePath = (locale: string, path = '/'): string => {
  const normalizedPath = ensureLeadingSlash(path)

  if (isDefaultLocale(locale)) {
    return normalizedPath
  }

  if (normalizedPath === '/') {
    return `/${locale}`
  }

  return `/${locale}${normalizedPath}`
}

export const buildLocaleAlternates = (pathBuilder: (locale: string) => string) => ({
  canonical: pathBuilder(defaultLocale),
  languages: supportedLocales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = pathBuilder(locale)
    return acc
  }, {}),
})

export const getNonDefaultLocaleParams = () => nonDefaultLocales.map((locale) => ({ locale }))

