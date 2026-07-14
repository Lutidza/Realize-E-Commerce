/**
 * @file src/RealizeCore/ui/layout/header/LanguageToggle/useLanguageToggle.ts
 * @version 1.0.0 – 2025-12-03 22:30
 * @description
 * Хук с бизнес-логикой переключения локалей для шапки.
 */

'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { localizationSettings } from '@/RealizeCore/localization/config'
import type { PayloadLocale } from '@/RealizeCore/localization'
import { useUiI18n } from '@/RealizeCore/localization/ui/hooks/useUiI18n'
import type { UiLocale, UiMessagePath } from '@/RealizeCore/localization/ui'
import {
  buildPathForLocale,
  getSupportedLocaleCodes,
  resolveLocaleFromPathname,
} from '@/RealizeCore/localization/ui/utils/localeRouting'
import type {
  LanguageToggleOption,
  UseLanguageToggleResult,
} from './LanguageToggle.types'
import EnFlagIcon from '@/RealizeCore/ui/assets/icons/flags/en.svg'
import RuFlagIcon from '@/RealizeCore/ui/assets/icons/flags/ru.svg'
import KaFlagIcon from '@/RealizeCore/ui/assets/icons/flags/ka.svg'

const flagIcons: Partial<Record<PayloadLocale, typeof EnFlagIcon>> = {
  en: EnFlagIcon,
  ru: RuFlagIcon,
  ka: KaFlagIcon,
}

const buildLocaleLabelKey = (locale: UiLocale): UiMessagePath =>
  `header.languageToggle.localeLabels.${locale}` as UiMessagePath

/**
 * @remarks
 * Возвращает данные для LanguageToggleView.
 */
export const useLanguageToggle = (): UseLanguageToggleResult => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale: currentLocale, baseSegments } = React.useMemo(
    () => resolveLocaleFromPathname(pathname),
    [pathname],
  )

  const { t } = useUiI18n({ localeOverride: currentLocale })

  const locales = React.useMemo(() => getSupportedLocaleCodes(), [])
  const localeDefinitions = React.useMemo(() => localizationSettings.payloadLocales, [])

  const resolveLocaleLabel = React.useCallback(
    (code: PayloadLocale, key: UiLocale): string => {
      const dictionaryKey = buildLocaleLabelKey(key)
      const translation = t(dictionaryKey)

      if (translation && translation !== dictionaryKey) {
        return translation
      }

      const fallbackLabel =
        localeDefinitions.find((definition) => definition.code === code)?.label ?? code

      return fallbackLabel
    },
    [localeDefinitions, t],
  )

  const localeOptions = React.useMemo<LanguageToggleOption[]>(
    () =>
      locales.map((code) => ({
        value: code,
        label: resolveLocaleLabel(code, code as UiLocale),
        icon: flagIcons[code],
      })),
    [locales, resolveLocaleLabel],
  )

  const handleSelectLocale = React.useCallback(
    (nextLocale: PayloadLocale) => {
      if (nextLocale === currentLocale) {
        return
      }

      const basePath = buildPathForLocale(nextLocale, baseSegments)
      const query = searchParams.toString()
      const url = query.length > 0 ? `${basePath}?${query}` : basePath

      router.push(url)
    },
    [baseSegments, currentLocale, router, searchParams],
  )

  return {
    ariaLabel: t('header.languageToggle.ariaLabel'),
    menuLabel: t('header.languageToggle.menuLabel'),
    currentLocale,
    options: localeOptions,
    onSelectAction: handleSelectLocale,
  }
}

export default useLanguageToggle
