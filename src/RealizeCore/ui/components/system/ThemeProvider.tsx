/**
 * @file src/RealizeCore/ui/components/system/ThemeProvider.tsx
 * @version 1.0.0 – 2025-11-30 19:05
 * @description
 * Глобальный провайдер темы для фронтенда проекта Realize.
 * Компонент является обёрткой над библиотекой next-themes и:
 * - управляет установкой CSS-класса .dark на корневом элементе;
 * - позволяет переключаться между темами 'light' / 'dark' / 'system';
 * - используется в публичной части и пользовательском дашборде.
 *
 * Последние изменения в версии 1.0.0:
 * - создан базовый ThemeProvider, совместимый с TailwindCSS и переменными из globals.css;
 * - экспортирован тип пропсов для удобной конфигурации при необходимости.
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * @remarks
 * Тип пропсов ThemeProvider совпадает с пропсами NextThemesProvider.
 * Это позволяет при необходимости переопределить параметры (defaultTheme, enableSystem и т.д.).
 */
export type AppThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

/**
 * @remarks
 * Глобальный провайдер темы приложения Realize.
 *
 * Ключевые настройки по умолчанию:
 * - attribute="class" — next-themes будет управлять классом (например, .dark) на корневом элементе;
 * - defaultTheme="system" — начальная тема определяется системными настройками пользователя;
 * - enableSystem — разрешает переключение на системную тему.
 *
 * @param props - Свойства ThemeProvider, включая дочерние элементы.
 * @returns JSX-разметка провайдера темы.
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider: React.FC<AppThemeProviderProps> = ({
                                                                   children,
                                                                   ...props
                                                               }) => {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
