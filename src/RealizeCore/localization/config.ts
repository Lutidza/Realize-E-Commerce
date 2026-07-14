/**
 * @file src/RealizeCore/localization/config.ts
 * @version 1.0.0 – 2025-02-18 12:10
 * @description Конфигурация локализации: парсинг env, подготовка структуры для Payload и фронтенда.
 *
 * Последние изменения:
 * - Добавлены описательные комментарии и строгая документация экспортируемых сущностей.
 */

export type LocalizationSettings = {
  locales: string[]
  defaultLocale: string
  fallbackLocale: string
  canonicalLocale: string
  payloadLocales: { code: string; label: string; rtl?: boolean }[]
  ogLocaleMap: Record<string, string>
}

/**
 * @param raw Строка с кодами локалей из переменной окружения `LOCALES`.
 * @returns Отфильтрованный массив кодов локалей без пустых значений.
 */
const parseLocales = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((locale) => locale.trim())
    .filter(Boolean)

const DEFAULT_LOCALES = [
  'en',
  'ru',
  'ka',
  'tr',
  'pl',
  'he',
  'kk',
  'az',
  'ar',
  'de',
  'fr',
  'es',
  'uk',
  'zh',
]
const parsedLocales = parseLocales(process.env.LOCALES)
const locales = parsedLocales.length > 0 ? parsedLocales : [...DEFAULT_LOCALES]

const defaultLocale = process.env.DEFAULT_LOCALE ?? locales[0]!

if (!locales.includes(defaultLocale)) {
  throw new Error(`DEFAULT_LOCALE "${defaultLocale}" must be one of LOCALES (${locales.join(', ')})`)
}

const fallbackLocale = process.env.FALLBACK_LOCALE ?? defaultLocale

if (!locales.includes(fallbackLocale)) {
  throw new Error(
    `FALLBACK_LOCALE "${fallbackLocale}" must be one of LOCALES (${locales.join(', ')})`,
  )
}

const canonicalLocale = process.env.CANONICAL_LOCALE ?? defaultLocale

if (!locales.includes(canonicalLocale)) {
  throw new Error(
    `CANONICAL_LOCALE "${canonicalLocale}" must be one of LOCALES (${locales.join(', ')})`,
  )
}

/**
 * @remarks Используем заранее описанные лейблы локалей для Payload admin.
 */
const localeLabels: Record<string, { label: string; rtl?: boolean }> = {
  en: { label: 'English' },
  ru: { label: 'Русский' },
  ka: { label: 'ქართული' },
  tr: { label: 'Türkçe' },
  pl: { label: 'Polski' },
  he: { label: 'עברית', rtl: true },
  kk: { label: 'Қазақ тілі' },
  az: { label: 'Azərbaycan' },
  ar: { label: 'العربية', rtl: true },
  de: { label: 'Deutsch' },
  fr: { label: 'Français' },
  es: { label: 'Español' },
  uk: { label: 'Українська' },
  zh: { label: '中文' },
}

const payloadLocales = locales.map((code) => ({
  code,
  label: localeLabels[code]?.label ?? code,
  ...(localeLabels[code]?.rtl ? { rtl: true } : {}),
}))

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  ka: 'ka_GE',
  tr: 'tr_TR',
  pl: 'pl_PL',
  he: 'he_IL',
  kk: 'kk_KZ',
  az: 'az_AZ',
  ar: 'ar_SA',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  uk: 'uk_UA',
  zh: 'zh_CN',
}

export const localizationSettings: LocalizationSettings = {
  locales,
  defaultLocale,
  fallbackLocale,
  canonicalLocale,
  payloadLocales,
  ogLocaleMap,
}

/**
 * @param locale Код локали, для которой нужен OG-мэппинг.
 * @returns Значение `og:locale`; при отсутствии — fallback на каноническую локаль.
 */
export const getOgLocale = (locale: string): string =>
  ogLocaleMap[locale] ?? ogLocaleMap[canonicalLocale] ?? canonicalLocale
