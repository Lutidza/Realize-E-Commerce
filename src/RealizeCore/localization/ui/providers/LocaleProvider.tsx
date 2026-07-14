/**
 * @file src/RealizeCore/localization/ui/providers/LocaleProvider.tsx
 * @version 1.0.0 – 2025-12-03 15:30
 * @description
 * Провайдер локали для клиентской части фронтенда Realize.
 *
 * Файл:
 * - вычисляет текущую локаль интерфейса исходя из pathname и атрибута data-locale;
 * - синхронизирует атрибуты data-locale <html>/<body> с роутингом Next.js;
 * - предоставляет React-контекст и хук useLocale() для удобного доступа к локали.
 *
 * Источник локали:
 * - каноническим источником является <html data-locale="...">,
 *   который выставляется на сервере через middleware + RootLayout.
 *
 * Последние изменения в версии 1.0.0:
 * - добавлен LocaleProvider и хук useLocale поверх data-locale.
 */

'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import { defaultLocale, getLocaleDirection } from '@/RealizeCore/localization'
import { resolveLocaleFromPathname } from '@/RealizeCore/localization/ui/utils/localeRouting'

/**
 * @remarks
 * Значение контекста локали.
 */
export type LocaleContextValue = {
  /**
   * @remarks
   * Текущая локаль интерфейса (например, 'en', 'ru', 'ka').
   */
  locale: string
}

/**
 * @remarks
 * Контекст локали для UI-слоя.
 *
 * По умолчанию использует defaultLocale, чтобы избежать undefined
 * при использовании вне провайдера (защита от ошибок).
 */
const LocaleContext = React.createContext<LocaleContextValue>({
  locale: defaultLocale,
})

/**
 * @remarks
 * Пропсы для LocaleProvider.
 */
export type LocaleProviderProps = {
  /**
   * @remarks
   * Дочерние элементы, которым будет доступна локаль из контекста.
   */
  children: React.ReactNode
}

/**
 * @remarks
 * Провайдер локали для фронтенда.
 *
 * Поведение:
 * - следит за изменениями маршрута через usePathname();
 * - вычисляет локаль на основе pathname (префикс /{locale});
 * - синхронизирует data-locale на <html>/<body>, чтобы сохранить источник правды для SSR;
 * - прокидывает финальную локаль в React-контекст.
 *
 * @param props - Дочерние элементы.
 * @returns JSX-разметка провайдера контекста локали.
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const pathname = usePathname()
  const [locale, setLocale] = React.useState<string>(defaultLocale)

  React.useEffect(() => {
    // В среде без DOM (теоретически) ничего не делаем.
    if (typeof document === 'undefined') {
      return
    }

    const { locale: nextLocale } = resolveLocaleFromPathname(pathname)
    const nextDirection = getLocaleDirection(nextLocale)
    const html = document.documentElement
    const body = document.body
    const currentAttr = html.getAttribute('data-locale')

    if (currentAttr !== nextLocale) {
      html.setAttribute('data-locale', nextLocale)
    }

    if (html.getAttribute('lang') !== nextLocale) {
      html.setAttribute('lang', nextLocale)
    }

    if (html.getAttribute('dir') !== nextDirection) {
      html.setAttribute('dir', nextDirection)
    }

    if (html.getAttribute('data-direction') !== nextDirection) {
      html.setAttribute('data-direction', nextDirection)
    }

    if (body && body.getAttribute('data-locale') !== nextLocale) {
      body.setAttribute('data-locale', nextLocale)
    }

    if (body && body.getAttribute('dir') !== nextDirection) {
      body.setAttribute('dir', nextDirection)
    }

    if (body && body.getAttribute('data-direction') !== nextDirection) {
      body.setAttribute('data-direction', nextDirection)
    }

    setLocale(nextLocale)
  }, [pathname])

  const contextValue = React.useMemo<LocaleContextValue>(
    () => ({ locale }),
    [locale],
  )

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  )
}

/**
 * @remarks
 * Хук для доступа к текущей локали из контекста.
 *
 * @returns Объект с единственным полем locale.
 *
 * @example
 * const { locale } = useLocale()
 */
export const useLocale = (): LocaleContextValue => {
  return React.useContext(LocaleContext)
}

export default LocaleProvider
