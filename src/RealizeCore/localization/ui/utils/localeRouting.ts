/**
 * @file src/RealizeCore/localization/ui/utils/localeRouting.ts
 * @version 1.0.0 – 2025-12-03 22:10
 * @description
 * Утилиты для работы с локалями в URL: определение текущей локали по pathname,
 * построение путей для целевой локали и получение списка поддерживаемых локалей.
 */

import type { PayloadLocale } from '@/RealizeCore/localization'
import {
  defaultLocale,
  isDefaultLocale,
  isSupportedLocale,
  supportedLocales,
} from '@/RealizeCore/localization'

/**
 * @remarks
 * Возвращает список всех локалей интерфейса в порядке:
 * defaultLocale → остальные (как в Payload-конфигурации).
 */
export const getSupportedLocaleCodes = (): PayloadLocale[] => [...supportedLocales]

/**
 * @remarks
 * Результат разбора pathname: локаль и "хвост" пути без префикса локали.
 */
export type LocalePathResolution = {
  locale: PayloadLocale
  baseSegments: string[]
}

/**
 * @remarks
 * Определяет локаль по pathname Next.js.
 *
 * Правила:
 * - если первый сегмент — поддерживаемая не-дефолтная локаль, считаем путь локализованным;
 * - иначе это defaultLocale, а сегменты остаются без изменений.
 *
 * @param pathname - Значение usePathname() (без query-строки).
 * @returns Локаль и массив сегментов без префикса локали.
 */
export const resolveLocaleFromPathname = (pathname: string): LocalePathResolution => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return {
      locale: defaultLocale,
      baseSegments: [],
    }
  }

  const first = segments[0]

  if (isSupportedLocale(first) && !isDefaultLocale(first)) {
    return {
      locale: first,
      baseSegments: segments.slice(1),
    }
  }

  return {
    locale: defaultLocale,
    baseSegments: segments,
  }
}

/**
 * @remarks
 * Собирает путь для целевой локали, учитывая правило:
 * - defaultLocale → путь без префикса;
 * - остальные → /{locale}/... .
 *
 * @param targetLocale - Локаль назначения.
 * @param baseSegments - Сегменты пути без префикса локали.
 * @returns Путь без query-строки.
 */
export const buildPathForLocale = (
  targetLocale: PayloadLocale,
  baseSegments: string[],
): string => {
  if (isDefaultLocale(targetLocale)) {
    const path = `/${baseSegments.join('/')}`
    return path === '/' ? '/' : path.replace(/\/+$/, '')
  }

  const tail = baseSegments.join('/')
  const path = tail.length > 0 ? `/${targetLocale}/${tail}` : `/${targetLocale}`
  return path.replace(/\/+$/, '')
}
