/**
 * @file src/RealizeCore/ui/layout/header/ThemeToggle/ThemeToggle.tsx
 * @version 1.2.0 – 2025-12-03 21:10
 * @description
 * Модуль переключателя темы для шапки: содержит чистую вьюху и контейнер,
 * который подключает useThemeToggle и прокидывает данные после монтирования.
 */

'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/RealizeCore/ui/components/shadcn/tooltip'
import { useUiI18n } from '@/RealizeCore/localization/ui/hooks/useUiI18n'
import type { ThemeToggleViewProps } from './ThemeToggle.types'
import { useThemeToggle } from './useThemeToggle'

/**
 * @remarks
 * Чистый UI-компонент переключателя темы.
 *
 * Особенности:
 * - не знает о next-themes, локали, mounted и т.п.;
 * - отвечает только за разметку и визуальное состояние;
 * - размер иконок приведён к 20px (h-5 w-5), чтобы совпадать с другими иконками в шапке.
 *
 * @param props - ariaLabel, isDark и onToggle, переданные из useThemeToggle.
 * @returns JSX-разметка кнопки-переключателя темы.
 */
export const ThemeToggleView: React.FC<ThemeToggleViewProps> = ({
                                                                  isDark,
                                                                  onToggleAction,
                                                                  isReady,
                                                                }) => {
  const { t } = useUiI18n()
  const ariaLabel = t('header.themeToggle.ariaLabel')

  return (
    <TooltipProvider delayDuration={800}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isReady ? onToggleAction : undefined}
            aria-label={ariaLabel}
            aria-pressed={isReady ? isDark : undefined}
            disabled={!isReady}
          >
            <span className="sr-only">{ariaLabel}</span>

            {/* Солнце для светлой темы */}
            <Sun
              className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              aria-hidden="true"
            />

            {/* Луна для тёмной темы */}
            <Moon
              className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * @remarks
 * Контейнер переключателя темы. Подключает useThemeToggle, ждёт монтирования
 * и передаёт локализованные пропсы во вьюху.
 */
export const ThemeToggle: React.FC = () => {
  const { mounted, isDark, onToggleAction } = useThemeToggle()

  return (
    <ThemeToggleView
      isDark={isDark}
      onToggleAction={onToggleAction}
      isReady={mounted}
    />
  )
}

export default ThemeToggle
