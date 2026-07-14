/**
 * @file src/app/(realize)/(default)/accounts/profile/page.tsx
 * @version 0.2.0 – 2025-12-24 04:45
 * @description
 * Главная страница личного кабинета (default маршрут). Требует авторизации.
 */

import { redirect } from 'next/navigation'

import ProfilePage from '@/RealizeCore/ui/pages/profile/ProfilePage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

export default async function DefaultAccountsProfilePage() {
  const session = await loadAccountSession()

  if (!session) {
    redirect('/accounts/login')
  }

  return <ProfilePage account={session} locale={localizationSettings.defaultLocale} />
}
