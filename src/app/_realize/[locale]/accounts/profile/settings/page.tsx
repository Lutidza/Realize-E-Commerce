/**
 * @file src/app/(realize)/[locale]/accounts/profile/settings/page.tsx
 * @version 0.2.0 – 2025-12-24 03:52
 * @description
 * Локализованная страница настроек профиля. Доступна только авторизованным аккаунтам.
 */

import { redirect } from 'next/navigation'

import ProfileSettingsPage from '@/RealizeCore/ui/pages/profile/ProfileSettingsPage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountsProfileSettingsPage({ params }: PageProps) {
  const { locale } = await params
  const session = await loadAccountSession()

  if (!session) {
    const loginLocale = locale ?? localizationSettings.defaultLocale
    redirect(`/${loginLocale}/accounts/login`)
  }

  return <ProfileSettingsPage />
}
