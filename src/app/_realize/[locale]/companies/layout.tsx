/**
 * @file src/app/(realize)/[locale]/companies/layout.tsx
 * @version 0.1.0 – 2025-12-26 22:15
 * @description Layout публичного раздела компаний для локализованных маршрутов "/[locale]/companies".
 */

import React from 'react'

type CompaniesLayoutProps = {
  children: React.ReactNode
}

/**
 * @remarks
 * Общий контейнер для списка и карточек компаний в локализованных URL.
 *
 * @param props.children Контент страниц внутри маршрута.
 * @returns JSX-обёртка раздела с унифицированными отступами.
 */
export default function LocalizedCompaniesLayout({ children }: CompaniesLayoutProps) {
  return <section className="bg-background py-6 md:py-10">{children}</section>
}
