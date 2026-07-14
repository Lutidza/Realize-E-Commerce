/**
 * @file src/RealizeCore/localization/payloadLanguages.ts
 * @version 1.0.0 – 2025-02-25 18:20
 * @description
 * Маппинг локалей проекта на языки, поддерживаемые Payload Admin (i18n).
 *
 * Файл:
 * - подключает готовые переводы из @payloadcms/translations;
 * - обеспечивает fallback на английский для локалей без штатной локализации (ka, kk);
 * - экспортирует объект supportedLanguages и код fallbackLanguage для payload.config.ts.
 */

import type { Language } from '@payloadcms/translations'
import { ar } from '@payloadcms/translations/languages/ar'
import { az } from '@payloadcms/translations/languages/az'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { fr } from '@payloadcms/translations/languages/fr'
import { he } from '@payloadcms/translations/languages/he'
import { pl } from '@payloadcms/translations/languages/pl'
import { ru } from '@payloadcms/translations/languages/ru'
import { tr } from '@payloadcms/translations/languages/tr'
import { uk } from '@payloadcms/translations/languages/uk'
import { zh } from '@payloadcms/translations/languages/zh'

import { localizationSettings } from './config'

type LanguageCode = string

const FALLBACK_LANGUAGE_CODE = 'en' as const satisfies LanguageCode

/**
 * @remarks
 * Поддерживаемые пакетом Payload переводы, использующиеся в админке.
 * Коды совмещены со списком локалей проекта, где это возможно.
 */
const AVAILABLE_TRANSLATIONS: Record<LanguageCode, Language> = {
  en,
  ru,
  tr,
  pl,
  he,
  az,
  ar,
  de,
  fr,
  es,
  uk,
  zh,
}

const FALLBACK_LANGUAGE = AVAILABLE_TRANSLATIONS[FALLBACK_LANGUAGE_CODE] ?? en

/**
 * @remarks
 * Коды языков Payload Admin, которые включаем в конфигурацию i18n.
 * Всегда содержит fallback (en) даже если он не объявлен в LOCALES.
 */
export const payloadFallbackLanguageCode = FALLBACK_LANGUAGE_CODE

export const payloadAdminLanguages = localizationSettings.locales.reduce<
  Record<LanguageCode, Language>
>((acc, locale) => {
  acc[locale] = AVAILABLE_TRANSLATIONS[locale] ?? FALLBACK_LANGUAGE
  return acc
}, { [FALLBACK_LANGUAGE_CODE]: FALLBACK_LANGUAGE })
