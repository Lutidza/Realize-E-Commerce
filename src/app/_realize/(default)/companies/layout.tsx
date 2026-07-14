/**
 * @file src/app/(realize)/(default)/companies/layout.tsx
 * @version 0.1.0 – 2025-12-26 22:15
 * @description Layout публичного раздела компаний для default-локали ("/companies").
 */

import React from 'react'

type CompaniesLayoutProps = {
  children: React.ReactNode
}

/**
 * @remarks
 * Единый контейнер для списка компаний и карточек в default-локали.
 * Добавляет отступы и ограничивает ширину контента.
 *
 * @param props.children Контент страницы.
 * @returns JSX-обёртка раздела.
 */
export default function DefaultCompaniesLayout({ children }: CompaniesLayoutProps) {
  return <section className="bg-background py-6 md:py-10">{children}</section>
}
