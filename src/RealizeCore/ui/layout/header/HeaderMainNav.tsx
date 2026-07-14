/**
 * @file src/RealizeCore/ui/components/layout/header/HeaderMainNav.tsx
 * @version 1.0.0 – 2025-12-01 23:05
 * @description
 * Основное горизонтальное меню шапки (header) для публичной части и дашборда.
 * Файл:
 * - рендерит набор навигационных ссылок в зависимости от варианта ('public' | 'dashboard');
 * - используется внутри AppHeader как центральный блок навигации на десктопе.
 *
 * Последние изменения в версии 1.0.0:
 * - вынесена логика основного меню из AppHeader в отдельный компонент;
 * - добавлены отдельные конфигурации пунктов меню для публичного режима и дашборда.
 */

import React from 'react'
import Link from 'next/link'

/**
 * @remarks
 * Вариант отображения меню:
 * - 'public'    — публичный фронт;
 * - 'dashboard' — личный кабинет пользователя.
 *
 * @todo
 * В дальнейшем имеет смысл вынести этот тип в общий Header.types.ts,
 * чтобы переиспользовать его в AppHeader и других подкомпонентах.
 */
export type HeaderMainNavVariant = 'public' | 'dashboard'

/**
 * @remarks
 * Пропсы основного меню шапки.
 */
export type HeaderMainNavProps = {
    /**
     * Вариант меню:
     * - 'public' — ссылки публичной части;
     * - 'dashboard' — ссылки разделов личного кабинета.
     */
    variant: HeaderMainNavVariant
}

/**
 * @remarks
 * Основное горизонтальное меню шапки.
 *
 * Поведение:
 * - в публичном варианте отображает ссылки:
 *   - Главная;
 *   - Объявления;
 *   - Инфо.
 * - в режиме дашборда отображает ссылки:
 *   - Обзор;
 *   - Мои объявления;
 *   - Профиль.
 *
 * В дальнейшем список ссылок может быть вынесен в отдельный конфигурационный файл
 * (например, Header.config.ts), а также дополнен данными из Payload или router-слоя.
 *
 * @param props - Вариант отображения меню.
 * @returns JSX-разметка списка навигационных ссылок.
 */
export const HeaderMainNav: React.FC<HeaderMainNavProps> = ({ variant }) => {
    const publicLinks: { href: string; label: string }[] = [
        { href: '/', label: 'Главная' },
        { href: '/rent/flat/tbilisi', label: 'Объявления' },
        { href: '/info', label: 'Инфо' },
    ]

    const dashboardLinks: { href: string; label: string }[] = [
        { href: '/dashboard', label: 'Обзор' },
        { href: '/dashboard/listings', label: 'Мои объявления' },
        { href: '/dashboard/profile', label: 'Профиль' },
    ]

    const links = variant === 'dashboard' ? dashboardLinks : publicLinks

    return (
        <ul className="flex items-center gap-4 text-sm font-medium">
            {links.map((link) => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default HeaderMainNav
