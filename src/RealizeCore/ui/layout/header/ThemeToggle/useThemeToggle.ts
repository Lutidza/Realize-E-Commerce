/**
 * @file src/RealizeCore/ui/layout/header/ThemeToggle/useThemeToggle.ts
 * @version 1.2.0 – 2025-12-03 19:15
 * @description
 * Логический хук для переключателя темы в шапке приложения.
 *
 * Файл:
 * - инкапсулирует работу с next-themes (theme, resolvedTheme, setTheme);
 * - берёт aria-label из UI-словаря через useUiI18n;
 * - решает проблему гидратации через флаг mounted;
 * - возвращает данные в формате, совместимом с ThemeToggleViewProps.
 *
 * Связанные файлы:
 * - ThemeToggle.types.ts — типы ThemeToggleViewProps и UseThemeToggleResult;
 * - ThemeToggle.tsx — чистая вьюха, принимающая ThemeToggleViewProps;
 * - index.tsx — компоновщик, который вызывает useThemeToggle и
 *   прокидывает результат во вьюху.
 */

'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import type { UseThemeToggleResult } from './ThemeToggle.types'

/**
 * @remarks
 * Хук, инкапсулирующий всю логику переключения темы для шапки.
 *
 * Поведение:
 * - после монтирования на клиенте выставляет mounted = true;
 * - через useTheme из next-themes получает theme, resolvedTheme, setTheme;
 * - вычисляет текущую тему с учётом режима "system";
 * - через useUiI18n получает ariaLabel из UI-словаря;
 * - возвращает объект { mounted, ariaLabel, isDark, onToggle }.
 *
 * @returns Объект UseThemeToggleResult для проброса в ThemeToggle.
 */
export const useThemeToggle = (): UseThemeToggleResult => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  /**
   * @remarks
   * Флаг mounted нужен, чтобы избежать несовпадения разметки
   * между серверным и клиентским рендером из-за разницы в resolvedTheme.
   */
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Определяем текущую тему с учётом режима "system".
  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'

  /**
   * @remarks
   * Обработчик переключения темы.
   *
   * @returns Ничего не возвращает, побочный эффект — изменение темы через setTheme.
   */
  const handleToggleTheme = React.useCallback((): void => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return {
    mounted,
    isDark,
    isReady: mounted,
    onToggleAction: handleToggleTheme,
  }
}

export default useThemeToggle
