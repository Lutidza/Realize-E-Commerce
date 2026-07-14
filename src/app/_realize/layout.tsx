/**
 * @file src/app/(realize)/layout.tsx
 * @version 1.3.1 – 2025-12-05 12:25
 * @description
 * Базовый layout для публичной части и пользовательского кабинета (dashboard)
 * в группе маршрутов (realize).
 *
 * Файл отвечает за:
 * - общий каркас фронта (фон, типографика, минимальная высота экрана);
 * - единый контейнер контента по центру;
 * - подключение общего хедера AppHeader для всех маршрутов (realize);
 * - оборачивание фронта в LocaleProvider для реактивной локали;
 * - резервную зону под общий footer.
 *
 * Последние изменения в версии 1.3.1:
 * - добавлены глобальные стили фронта (Tailwind + тема) и ThemeProvider;
 * - LocaleProvider остался внутри фронтового дерева и получает локаль из data-атрибута html.
 */

import React from 'react'

import '@/RealizeCore/ui/theme/globals.css'
import { AppHeader } from '@/RealizeCore/ui/layout/header/AppHeader'
import { LocaleProvider } from '@/RealizeCore/localization/ui/providers/LocaleProvider'
import { ThemeProvider } from '@/RealizeCore/ui/components/system/ThemeProvider'
import BaseContentContainer from '@/RealizeCore/ui/layout/containers/BaseContentContainer'

type RealizeLayoutProps = {
  children: React.ReactNode
}

/**
 * @remarks
 * Layout для группы маршрутов (realize), в которую входят:
 * - публичные страницы (home, info, listing и т.п.);
 * - будущий пользовательский кабинет (dashboard).
 *
 * Каркас:
 * - корневой div задаёт фон, цвет текста и типографику (синхронно с темой Tailwind);
 * - внутри подключается LocaleProvider, обеспечивающий реактивную локаль для UI;
 * - flex-колонка растягивается на всю высоту экрана;
 * - верхняя зона — общий хедер AppHeader;
 * - main содержит централизованный контейнер с max-width, отступами и адаптивной шириной;
 * - внизу зарезервирован footer.
 *
 * @param props - Дочерние элементы маршрутов группы (realize).
 * @returns JSX-разметка layout-обёртки для публичной части и dashboard.
 */
export default function RealizeLayout({ children }: RealizeLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <LocaleProvider>
            <AppHeader />
            <BaseContentContainer>{children}</BaseContentContainer>
            <footer className="w-full" aria-label="Site footer" />
        </LocaleProvider>
      </div>
    </ThemeProvider>
  )
}
