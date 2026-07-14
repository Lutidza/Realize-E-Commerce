/**
 * @file src/app/(realize)/[locale]/accounts/profile/page.tsx
 * @version 0.2.0 – 2025-12-24 04:45
 * @description
 * Главная страница личного кабинета (требует авторизации, локализованная).
 */

import { redirect } from 'next/navigation'

import ProfilePage from '@/RealizeCore/ui/pages/profile/ProfilePage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountsProfilePage({ params }: PageProps) {
  const { locale } = await params
  const session = await loadAccountSession()

  if (!session) {
    const loginLocale = locale ?? localizationSettings.defaultLocale
    redirect(`/${loginLocale}/accounts/login`)
  }

  const resolvedLocale = locale ?? localizationSettings.defaultLocale

  return <ProfilePage account={session} locale={resolvedLocale} />
}
