/**
 * @file src/app/(realize)/[locale]/accounts/companies/page.tsx
 * @version 0.1.0 – 2025-12-24 05:05
 * @description
 * Страница «Мои компании» (локализованный маршрут, доступна только авторизованным пользователям).
 */

import { redirect } from 'next/navigation'

import ProfileCompaniesPage from '@/RealizeCore/ui/pages/profile/ProfileCompaniesPage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountsCompaniesPage({ params }: PageProps) {
  const { locale } = await params
  const session = await loadAccountSession()

  if (!session) {
    const loginLocale = locale ?? localizationSettings.defaultLocale
    redirect(`/${loginLocale}/accounts/login`)
  }

  const resolvedLocale = locale ?? localizationSettings.defaultLocale

  return <ProfileCompaniesPage account={session} locale={resolvedLocale} />
}
