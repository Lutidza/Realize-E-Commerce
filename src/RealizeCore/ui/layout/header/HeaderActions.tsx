/**
 * @file src/RealizeCore/ui/layout/header/HeaderActions.tsx
 * @version 1.3.1 – 2025-12-24 04:10
 * @description
 * Блок действий в шапке (правый край хедера) с учётом статуса авторизации.
 * Включает dropdown-меню с ссылками входа/регистрации или профиля/выхода.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CircleUserRound, LogOut, LogIn, UserRoundCog } from 'lucide-react'

import type { Account, Config } from '@/payload-types'
import { localizationSettings } from '@/RealizeCore/localization/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/RealizeCore/ui/components/shadcn/dropdown-menu'
import { getUiMessage } from '@/RealizeCore/localization/ui'

/**
 * @remarks
 * Варианты использования HeaderActions.
 * На будущее оставляем разделение публичного фронта и дашборда.
 */
export type HeaderActionsVariant = 'public' | 'dashboard'

/**
 * @remarks
 * Пропсы компонента HeaderActions.
 *
 * @property variant - Контекст использования хедера (публичный фронт / дашборд).
 */
export interface HeaderActionsProps {
  variant: HeaderActionsVariant
}

type SupportedLocale = Config['locale']
type SessionState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: Account }

/**
 * @remarks
 * Определяет локаль, присутствующую в первом сегменте path.
 * @param pathname Текущий путь.
 * @returns Код локали или null.
 */
const resolveLocaleFromPath = (pathname: string | null): SupportedLocale | null => {
  if (!pathname) {
    return null
  }
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  return localizationSettings.payloadLocales.some((locale) => locale.code === first)
    ? (first as SupportedLocale)
    : null
}

/**
 * @remarks
 * Блок действий в шапке: иконка пользователя с dropdown по статусу авторизации.
 *
 * @param props.variant - Контекст использования (сейчас не влияет на разметку).
 * @returns JSX-разметка блока действий.
 *
 * @example
 * <HeaderActions variant="public" />
 */
export const HeaderActions: React.FC<HeaderActionsProps> = ({ variant: _variant }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = React.useState<SessionState>({ status: 'loading' })

  const locale = React.useMemo(() => resolveLocaleFromPath(pathname), [pathname])
  const baseAccountPath = locale ? `/${locale}/accounts` : '/accounts'
  const loginPath = `${baseAccountPath}/login`
  const registerPath = `${baseAccountPath}/register`
  const profilePath = `${baseAccountPath}/profile`
  const profileSettingsPath = `${baseAccountPath}/profile/settings`
  const accountMessages = React.useMemo(
    () => ({
      login: getUiMessage(locale, 'header.account.loginLabel'),
      register: getUiMessage(locale, 'header.account.registerLabel'),
      profile: getUiMessage(locale, 'header.account.profileLabel'),
      settings: getUiMessage(locale, 'header.account.settingsLabel'),
      logout: getUiMessage(locale, 'header.account.logoutLabel'),
      menu: getUiMessage(locale, 'header.account.menuLabel'),
      signedInAs: getUiMessage(locale, 'header.account.signedInAs'),
    }),
    [locale],
  )

  const fetchSession = React.useCallback(async () => {
    let nextState: SessionState = { status: 'unauthenticated' }
    try {
      const response = await fetch('/api/accounts/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({ user: null }))
      if (response.ok && data?.user) {
        nextState = { status: 'authenticated', user: data.user as Account }
      }
    } catch {
      nextState = { status: 'unauthenticated' }
    }
    setSession(nextState)
  }, [])

  React.useEffect(() => {
    void fetchSession()
  }, [fetchSession, pathname])

  React.useEffect(() => {
    const handleFocus = () => {
      void fetchSession()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchSession])

  const handleLogout = async () => {
    try {
      await fetch('/api/accounts/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      void fetchSession()
      router.refresh()
    }
  }

  const renderMenuItems = () => {
    if (session.status === 'authenticated') {
      const email = session.user.email ?? 'account'
      return (
        <>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {accountMessages.signedInAs}
            <span className="block font-semibold text-foreground">{email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profilePath} className="flex items-center gap-2">
              <UserRoundCog className="h-4 w-4" />
              {accountMessages.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={profileSettingsPath} className="flex items-center gap-2">
              <UserRoundCog className="h-4 w-4" />
              {accountMessages.settings}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault()
              void handleLogout()
            }}
          >
            <LogOut className="h-4 w-4" />
            {accountMessages.logout}
          </DropdownMenuItem>
        </>
      )
    }

    return (
      <>
        <DropdownMenuItem asChild>
          <Link href={loginPath} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            {accountMessages.login}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={registerPath} className="flex items-center gap-2">
            <CircleUserRound className="h-4 w-4" />
            {accountMessages.register}
          </Link>
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label={accountMessages.menu}
          title={accountMessages.menu}
        >
          <CircleUserRound className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderActions
