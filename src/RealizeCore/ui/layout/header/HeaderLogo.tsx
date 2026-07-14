/**
 * @file src/RealizeCore/ui/components/layout/header/HeaderLogo.tsx
 * @version 1.0.0 – 2025-12-01 22:55
 * @description
 * Компонент логотипа для шапки приложения Realize.
 * Файл:
 * - отвечает только за отображение брендового логотипа и ссылки на корень;
 * - используется в публичной части и может быть переиспользован в дашборде.
 *
 * Последние изменения в версии 1.0.0:
 * - добавлен базовый текстовый логотип "Realize" с компактным значком слева;
 * - предусмотрен проп href для переназначения целевого URL при необходимости.
 */

import React from 'react'
import Link from 'next/link'

/**
 * @remarks
 * Пропсы логотипа.
 *
 * href:
 * - по умолчанию ведёт на корень "/";
 * - может быть переопределён (например, на "/dashboard" для кабинета).
 */
export type HeaderLogoProps = {
    href?: string
}

/**
 * @remarks
 * Логотип Realize для шапки.
 *
 * Поведение:
 * - рендерит компактный значок с буквой "R" и подпись "Realize";
 * - на мобильных устройствах отображается только значок, текст скрывается (сохраняя компактность);
 * - по клику ведёт на href ("/" по умолчанию).
 *
 * @param props - Объект с настройками логотипа (href).
 * @returns JSX-разметка логотипа.
 *
 * @example
 * <HeaderLogo />                // ссылка на "/"
 * <HeaderLogo href="/dashboard" /> // ссылка на "/dashboard"
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({ href = '/' }) => {
    return (
        <Link href={href} className="flex items-center gap-2" aria-label="Realize – на главную">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-base font-semibold">
        R
      </span>
            <span className="hidden text-base font-semibold sm:inline">Realize</span>
        </Link>
    )
}

export default HeaderLogo
