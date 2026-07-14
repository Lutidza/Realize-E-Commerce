/**
 * @file src/app/(realize)/(default)/accounts/profile/settings/page.tsx
 * @version 0.2.0 – 2025-12-24 03:52
 * @description
 * Дефолтная страница настроек профиля. Требует авторизации пользователя.
 */

import { redirect } from 'next/navigation'

import ProfileSettingsPage from '@/RealizeCore/ui/pages/profile/ProfileSettingsPage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'

export const dynamic = 'force-dynamic'

export default async function DefaultAccountsProfileSettingsPage() {
  const session = await loadAccountSession()

  if (!session) {
    redirect('/accounts/login')
  }

  return <ProfileSettingsPage />
}
