/**
 * @file src/RealizeCore/ui/layout/header/AppHeader.tsx
 * @version 1.3.0 – 2025-12-03 09:05
 * @description
 * Главная шапка публичного фронта приложения.
 * Файл:
 * - рендерит логотип, основную навигацию и блок действий;
 * - подключает переключатель языка и переключатель темы;
 * - использует shadcn/tailwind-классы для оформления;
 * - контейнер и внутренние блоки выровнены по центру, основное содержимое распределено по схеме:
 *   [логотип] — по левому краю, [навигация] — строго по центру, [действия] — по правому краю.
 *
 * Последние изменения в версии 1.3.0:
 * - структура внутреннего контейнера переработана на три колонки с flex-1;
 * - навигация центрирована, левая и правая колонка выровнены по краям.
 */

import React from 'react'

import { HeaderLogo } from './HeaderLogo'
import { HeaderMainNav } from './HeaderMainNav'
import { HeaderActions } from './HeaderActions'
import { LanguageToggle } from './LanguageToggle/LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

/**
 * @remarks
 * Компонент шапки публичной части приложения.
 *
 * Структура:
 * - внешний контейнер:
 *   - `container mx-auto flex h-14 items-center justify-between px-4`;
 *   - центрируется и ограничен по ширине согласно настройкам Tailwind;
 *   - распределяет три внутренних блока по горизонтали;
 * - левая колонка (flex-1, align-left): логотип;
 * - центральная колонка (flex-1, justify-center): основная навигация;
 * - правая колонка (flex-1, justify-end): переключатель языка, переключатель темы, ссылка в аккаунт.
 *
 * @returns JSX-разметка шапки.
 */
export const AppHeader: React.FC = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Левая колонка: логотип */}
        <div className="flex flex-1 items-center">
          <HeaderLogo />
        </div>

        {/* Центральная колонка: основная навигация строго по центру */}
        <div className="flex flex-1 items-center justify-center">
          <HeaderMainNav variant="public" />
        </div>

        {/* Правая колонка: действия и переключатели */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <HeaderActions variant="public" />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
