/**
 * @file src/app/(realize)/(default)/accounts/companies/page.tsx
 * @version 0.1.0 – 2025-12-24 05:05
 * @description
 * Default-роут страницы «Мои компании», доступный только авторизованным пользователям.
 */

import { redirect } from 'next/navigation'

import ProfileCompaniesPage from '@/RealizeCore/ui/pages/profile/ProfileCompaniesPage'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

export default async function DefaultAccountsCompaniesPage() {
  const session = await loadAccountSession()

  if (!session) {
    redirect('/accounts/login')
  }

  return <ProfileCompaniesPage account={session} locale={localizationSettings.defaultLocale} />
}
