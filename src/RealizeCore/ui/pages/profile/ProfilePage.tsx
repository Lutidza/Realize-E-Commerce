/**
 * @file src/RealizeCore/ui/pages/profile/ProfilePage.tsx
 * @version 0.2.0 – 2025-12-24 04:45
 * @description
 * Главная страница личного кабинета: сводка профиля и стартовые виджеты.
 */

import React from 'react'

import type { Account } from '@/payload-types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/RealizeCore/ui/components/shadcn/card'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import { Input } from '@/RealizeCore/ui/components/shadcn/input'
import { Separator } from '@/RealizeCore/ui/components/shadcn/separator'
import AccountNavigation from '@/RealizeCore/ui/layout/account/AccountNavigation'
import {
  buildLocalizedAccountNavItems,
  type AccountNavItem,
} from '@/RealizeCore/ui/layout/account/navItems'
import { getUiMessage } from '@/RealizeCore/localization/ui'

const MetricTile = ({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: string
}) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    {trend ? (
      <CardContent className="pt-0">
        <span className="text-xs text-muted-foreground">{trend}</span>
      </CardContent>
    ) : null}
  </Card>
)

const ListingPreview = ({
  title,
  status,
  views,
  date,
}: {
  title: string
  status: string
  views: number
  date: string
}) => (
  <div className="flex flex-col gap-1 rounded-lg border p-4">
    <div className="flex items-center justify-between text-sm font-medium">
      <span>{title}</span>
      <span className="text-xs capitalize text-muted-foreground">{status}</span>
    </div>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{views} views</span>
      <span>{date}</span>
    </div>
  </div>
)

export interface ProfilePageProps {
  account: Account
  locale: string
}

/**
 * @remarks
 * Отрисовывает краткую информацию об аккаунте и placeholder блоки кабинета.
 * @param props.account Текущий аккаунт.
 * @returns JSX-разметка профиля.
 */
export const ProfilePage: React.FC<ProfilePageProps> = ({ account, locale }) => {
  const navItems: AccountNavItem[] = buildLocalizedAccountNavItems(
    locale,
    getUiMessage,
  ).map((item) => {
    if (item.key === 'notifications') return { ...item, badge: '3' }
    if (item.key === 'chats') return { ...item, badge: '5' }
    return item
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <AccountNavigation items={navItems} activeHref="/accounts/profile" desktopClassName="w-[260px]" />
        <div className="flex-1 space-y-6">
          <div className="grid gap-4 rounded-2xl bg-gradient-to-br from-violet-400/15 via-indigo-300/10 to-background p-6 text-sm text-muted-foreground md:grid-cols-[2fr,1fr] md:items-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-primary/70">Панель управления</p>
              <h1 className="text-2xl font-semibold text-foreground">
                Добро пожаловать, {account.firstName || account.email}
              </h1>
              <p>
                Управляйте объявлениями, лидами и клиентами в одном месте. Мы помогим вам принимать
                решения быстрее.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm">Добавить объявление</Button>
                <Button size="sm" variant="outline">
                  Тарифы и услуги
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">Контакты</div>
              <div className="mt-2 grid gap-1 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{account.email}</span>
                <span className="text-muted-foreground mt-3">Телефон</span>
                <span className="font-medium text-foreground">
                  {account.phone || 'Добавьте номер телефона'}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">Статус</div>
              <div className="text-sm font-medium text-foreground">
                {typeof account.role === 'object' ? account.role.label : 'Member'}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricTile label="Активные объявления" value="12" trend="+2 за неделю" />
            <MetricTile label="Новые лиды" value="38" trend="+12% неделя к неделе" />
            <MetricTile label="Конверсия" value="8.4%" trend="Лучший квартал" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Мои объявления</CardTitle>
                <CardDescription>Последние публикации и статусы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ListingPreview
                  title="Современный лофт в Ваке"
                  status="опубликовано"
                  views={420}
                  date="Обновлено 2 часа назад"
                />
                <ListingPreview
                  title="Дом у Мцхеты"
                  status="модерация"
                  views={112}
                  date="Отправлено вчера"
                />
                <ListingPreview
                  title="Студия в Сабуртало"
                  status="черновик"
                  views={0}
                  date="Черновик сохранён"
                />
                <Button variant="outline" className="w-full">
                  Все объявления
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Лиды и сообщения</CardTitle>
                <CardDescription>Новые запросы клиентов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {[
                  { name: 'Нино Д.', interest: 'Апартаменты с видом', time: '5 мин назад' },
                  { name: 'Gabriel M.', interest: 'Вилла в Мцхете', time: '2 ч назад' },
                  { name: 'Irakli T.', interest: 'Офис на Руставели', time: 'Вчера' },
                ].map((lead) => (
                  <div key={lead.name} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{lead.time}</span>
                      <button className="text-primary hover:underline">Открыть диалог</button>
                    </div>
                    <div className="font-medium text-foreground">{lead.name}</div>
                    <div className="text-muted-foreground">{lead.interest}</div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Перейти в Чаты
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Пригласить клиента</CardTitle>
              <CardDescription>
                Отслеживайте показатели и интересы клиентов в режиме онлайн.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input placeholder="client@email.com" className="md:w-auto" />
                <Button className="md:w-auto">Отправить приглашение</Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Клиенты будут получать уведомления о сохранённых поисках и избранных объектах.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
