/**
 * @file src/RealizeCore/ui/pages/profile/CreateCompanyPage.tsx
 * @version 1.0.0 – 2025-02-26 11:05
 * @description
 * Страница создания компании в кабинете пользователя.
 */

import React from 'react'

import type { Account } from '@/payload-types'
import AccountNavigation from '@/RealizeCore/ui/layout/account/AccountNavigation'
import {
  buildLocalizedAccountNavItems,
  type AccountNavItem,
} from '@/RealizeCore/ui/layout/account/navItems'
import { getUiMessage } from '@/RealizeCore/localization/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/RealizeCore/ui/components/shadcn/card'
import CreateCompanyForm from '@/RealizeCore/ui/components/companies/CreateCompanyForm'

export interface CreateCompanyPageProps {
  account: Account
  locale: string
}

const CreateCompanyPage: React.FC<CreateCompanyPageProps> = ({ account, locale }) => {
  const navItems: AccountNavItem[] = buildLocalizedAccountNavItems(locale, (loc, path) =>
    getUiMessage(loc, path),
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
            <p className="text-sm text-muted-foreground">Регистрация компании</p>
            <h1 className="text-2xl font-semibold text-foreground">Создание компании</h1>
            <p className="text-sm text-muted-foreground">
              Укажите юридические данные, контакты и ссылки. После модерации компания станет доступна
              для вашей команды и клиентов портала.
            </p>
          </header>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Данные компании</CardTitle>
              <CardDescription>
                Форма предназначена для владельцев агентств или застройщиков. Интеграция с API будет
                добавлена позднее.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateCompanyForm
                locale={locale}
                defaultPhone={account.phone || ''}
                defaultEmail={account.email}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateCompanyPage
