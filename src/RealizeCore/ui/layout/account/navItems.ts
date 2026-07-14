/**
 * @file src/RealizeCore/ui/layout/account/navItems.ts
 * @version 0.1.0 – 2025-12-24 05:35
 * @description
 * Общий список пунктов навигации личного кабинета (без client-only кода).
 */

import type { UiMessagePath } from '@/RealizeCore/localization/ui'

type AccountNavMessageKey = Extract<UiMessagePath, `accountNav.${string}`>

export type AccountNavItem = {
  key: string
  label: string
  href: string
  badge?: string
}

type AccountNavDefinition = Omit<AccountNavItem, 'label'> & {
  label: AccountNavMessageKey
}

export const defaultAccountNavItems: AccountNavDefinition[] = [
  { key: 'dashboard', label: 'accountNav.dashboard', href: '/accounts/profile' },
  { key: 'listings', label: 'accountNav.listings', href: '/accounts/listings' },
  { key: 'favorites', label: 'accountNav.favorites', href: '/accounts/favorites' },
  { key: 'compare', label: 'accountNav.compare', href: '/accounts/compare' },
  { key: 'searches', label: 'accountNav.searches', href: '/accounts/searches' },
  { key: 'plans', label: 'accountNav.plans', href: '/accounts/plans' },
  { key: 'balance', label: 'accountNav.balance', href: '/accounts/balance' },
  { key: 'payments', label: 'accountNav.payments', href: '/accounts/payments' },
  { key: 'companies', label: 'accountNav.companies', href: '/accounts/companies' },
  { key: 'notifications', label: 'accountNav.notifications', href: '/accounts/notifications' },
  { key: 'chats', label: 'accountNav.chats', href: '/accounts/chats' },
  { key: 'support', label: 'accountNav.support', href: '/accounts/support' },
]

export const buildLocalizedAccountNavItems = (
  locale: string | null | undefined,
  resolveMessage: (locale: string | null | undefined, path: AccountNavMessageKey) => string,
): AccountNavItem[] =>
  defaultAccountNavItems.map((item) => ({
    ...item,
    label: resolveMessage(locale, item.label),
  }))

export default defaultAccountNavItems
