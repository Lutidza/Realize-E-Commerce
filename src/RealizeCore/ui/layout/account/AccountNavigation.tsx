/**
 * @file src/RealizeCore/ui/layout/account/AccountNavigation.tsx
 * @version 0.2.0 – 2025-12-24 05:35
 * @description
 * Общая навигация личного кабинета (desktop + mobile) с современным градиентным стилем.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  Home,
  Building,
  Heart,
  ArrowRightLeft,
  Search,
  Layers,
  Wallet,
  CreditCard,
  Briefcase,
  Bell,
  MessageCircle,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AccountNavItem } from './navItems'

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <Home className="h-4 w-4" />,
  listings: <Building className="h-4 w-4" />,
  favorites: <Heart className="h-4 w-4" />,
  compare: <ArrowRightLeft className="h-4 w-4" />,
  searches: <Search className="h-4 w-4" />,
  plans: <Layers className="h-4 w-4" />,
  balance: <Wallet className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  companies: <Briefcase className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  chats: <MessageCircle className="h-4 w-4" />,
  support: <LifeBuoy className="h-4 w-4" />,
}

export interface AccountNavigationProps {
  items: AccountNavItem[]
  activeHref?: string
  desktopClassName?: string
  mobileClassName?: string
}

export const AccountNavigation: React.FC<AccountNavigationProps> = ({
  items,
  activeHref,
  desktopClassName,
  mobileClassName,
}) => {
  return (
    <>
      <nav
        className={cn(
          'flex gap-2 overflow-x-auto rounded-xl border border-border/40 bg-background/70 p-3 text-xs font-medium text-muted-foreground backdrop-blur lg:hidden',
          mobileClassName,
        )}
      >
        {items.map((item) => {
          const isActive = activeHref ? activeHref === item.href : false
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-full border border-border/40 px-3 py-1 transition-all',
                isActive
                  ? 'bg-gradient-to-r from-rose-500/20 to-violet-500/20 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-violet-500/10',
              )}
            >
              {iconMap[item.key] ?? null}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <aside
        className={cn(
          'sticky top-6 hidden h-fit space-y-4 rounded-xl border border-border/50 bg-background/60 px-4 py-6 backdrop-blur shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)] lg:block w-[260px]',
          desktopClassName,
        )}
      >
        <div className="px-3 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
          Навигация
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = activeHref ? activeHref === item.href : false
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all',
                  isActive
                    ? 'border border-border/50 bg-gradient-to-r from-rose-500/16 to-violet-500/16 text-foreground shadow-[0_18px_50px_-34px_rgba(0,0,0,0.55)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-violet-500/10',
                )}
              >
                  <span className="flex items-center gap-2">
                    {iconMap[item.key] ?? null}
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="ml-3 rounded-full bg-gradient-to-r from-rose-500/70 to-violet-500/70 px-2 text-xs font-semibold text-white">
                      {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default AccountNavigation
