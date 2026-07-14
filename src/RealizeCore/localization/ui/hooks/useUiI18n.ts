/**
 * @file src/RealizeCore/localization/ui/hooks/useUiI18n.ts
 * @version 1.3.2 – 2025-12-03 19:35
 * @description
 * Универсальный клиентский React-хук для работы с UI-словарями (i18n) фронтенда.
 *
 * Файл:
 * - берёт текущую локаль интерфейса из контекста LocaleProvider;
 * - при необходимости позволяет переопределить локаль через localeOverride;
 * - использует инфраструктурную функцию getUiMessage(locale, path) для получения строк по ключу;
 * - возвращает удобный API { locale, t } для использования в компонентах (shadcn, layout, страницы).
 *
 * Особенности:
 * - опирается на те же локали, что и Payload-конфигурация (через resolveUiLocale UI-слоя);
 * - сам не лезет в DOM и не парсит URL — всю синхронизацию с data-locale делает LocaleProvider;
 * - рассчитан на использование в любых client components (ThemeToggle, LanguageToggle, HeaderActions и т.д.).
 */

'use client'

import * as React from 'react'

import {
  getUiMessage,
  resolveUiLocale,
  type UiMessagePath,
} from '@/RealizeCore/localization/ui'
import { useLocale } from '@/RealizeCore/localization/ui/providers/LocaleProvider'

/**
 * @remarks
 * Опции для хука useUiI18n.
 */
export type UseUiI18nOptions = {
  /**
   * @remarks
   * Явное переопределение локали.
   *
   * Если указано:
   * - хук не использует значение из контекста LocaleProvider;
   * - использует именно это значение как источник локали (через resolveUiLocale).
   *
   * Может быть полезно:
   * - в тестах;
   * - в изолированных Storybook/preview-сценариях;
   * - при необходимости отрендерить компонент в конкретной локали независимо от глобального состояния.
   */
  localeOverride?: string | null
}

/**
 * @remarks
 * Результат, возвращаемый хуком useUiI18n.
 */
export type UseUiI18nResult = {
  /**
   * @remarks
   * Фактическая локаль интерфейса, используемая для получения строк.
   * Определяется:
   * - либо через localeOverride (если опция передана),
   * - либо через контекст LocaleProvider,
   * - нормализуется через resolveUiLocale (fallback на defaultLocale).
   */
  locale: string

  /**
   * @remarks
   * Функция для получения локализованной UI-строки по ключу.
   *
   * @param path - Ключ сообщения (см. UiMessagePath, например 'header.themeToggle.ariaLabel').
   * @returns Локализованная строка (или, в крайних случаях, сам path, если перевода нет).
   */
  t: (path: UiMessagePath) => string
}

/**
 * @remarks
 * Универсальный хук для доступа к UI-словарям (i18n) фронтенда.
 *
 * Поведение:
 * - получает локаль из LocaleProvider (который синхронизируется с <html data-locale="...">);
 * - при наличии options.localeOverride:
 *   - использует её как базовую локаль (baseLocale);
 * - далее через resolveUiLocale(baseLocale) приводит локаль
 *   к одному из поддерживаемых значений или к defaultLocale;
 * - предоставляет мемоизированную функцию t(path), которая обращается к
 *   getUiMessage(effectiveLocale, path), делегируя всю логику fallback'ов
 *   в слой localization/ui.
 *
 * Ограничения:
 * - предназначен только для использования в client components (использует React-хуки);
 * - не должен импортироваться в серверные компоненты Next.js (RSC).
 *
 * @param options - Необязательные настройки поведения хука (localeOverride и др. в будущем).
 * @returns Объект с текущей локалью и функцией t для получения сообщений.
 *
 * @example
 * // Внутри client component:
 * const { t } = useUiI18n()
 * const ariaLabel = t('header.themeToggle.ariaLabel')
 */
export const useUiI18n = (options?: UseUiI18nOptions): UseUiI18nResult => {
  // Локаль из контекста, синхронизированного с <html data-locale="...">
  const { locale: contextLocale } = useLocale()

  /**
   * @remarks
   * Базовая локаль до нормализации:
   * - приоритет у options.localeOverride;
   * - если не задано — используем локаль из контекста.
   */
  const baseLocale = options?.localeOverride ?? contextLocale

  /**
   * @remarks
   * Фактическая локаль после нормализации через resolveUiLocale.
   * Гарантированно принадлежит множеству поддерживаемых локалей UI-слоя.
   */
  const effectiveLocale = React.useMemo<string>(
    () => resolveUiLocale(baseLocale),
    [baseLocale],
  )

  /**
   * @remarks
   * Мемоизированная функция перевода.
   * Обновляется только при изменении effectiveLocale.
   *
   * @param path - Ключ сообщения (UiMessagePath).
   * @returns Локализованная строка.
   */
  const t = React.useCallback(
    (path: UiMessagePath): string => {
      return getUiMessage(effectiveLocale, path)
    },
    [effectiveLocale],
  )

  return {
    locale: effectiveLocale,
    t,
  }
}

export default useUiI18n

