/**
 * @file src/RealizeCore/ui/pages/profile/ProfileCompaniesPage.tsx
 * @version 0.1.0 – 2025-12-24 05:05
 * @description
 * Страница «Мои компании» в кабинете пользователя. Показывает CTA, если компании отсутствуют.
 */

import React from 'react'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/RealizeCore/ui/components/shadcn/card'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import type { Account } from '@/payload-types'
import AccountNavigation from '@/RealizeCore/ui/layout/account/AccountNavigation'
import {
  buildLocalizedAccountNavItems,
  type AccountNavItem,
} from '@/RealizeCore/ui/layout/account/navItems'
import { getUiMessage } from '@/RealizeCore/localization/ui'
import { formatLocalePath } from '@/RealizeCore/localization'

export interface ProfileCompaniesPageProps {
  account: Account
  locale: string
}

export const ProfileCompaniesPage: React.FC<ProfileCompaniesPageProps> = ({ account, locale }) => {
  const navItems: AccountNavItem[] = buildLocalizedAccountNavItems(
    locale,
    getUiMessage,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <AccountNavigation
          items={navItems}
          activeHref="/accounts/companies"
          desktopClassName="w-[260px]"
        />
        <div className="flex-1 space-y-6">
          <header className="space-y-2">
            <p className="text-sm text-muted-foreground">Управление компаниями</p>
            <h1 className="text-2xl font-semibold text-foreground">Мои компании</h1>
            <p className="text-sm text-muted-foreground">
              Здесь появятся компании, в которых вы работаете. Добавьте свою компанию или
              присоединитесь к существующей, чтобы управлять объявлениями и командой.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Создать компанию</CardTitle>
                <CardDescription>
                  Зарегистрируйте бренд или агентство и управляйте агентами, объявлениями и тарифами.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Укажите название, юридические данные и пригласите коллег. После модерации компания
                  появится в кабинете и будет доступна для клиентов портала.
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href={formatLocalePath(locale, '/accounts/companies/create')}>
                    Создать новую компанию
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Стать агентом</CardTitle>
                <CardDescription>
                  Присоединитесь к команде существующей компании по приглашению или запросите
                  доступ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Введите код приглашения или свяжитесь с руководителем агентства, чтобы он
                  подтвердил вас в составе команды. Это откроет доступ к корпоративным тарифам и
                  лидам.
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  Вступить в компанию
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompaniesPage
