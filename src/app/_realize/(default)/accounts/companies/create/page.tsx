/**
 * @file src/app/(realize)/(default)/accounts/companies/create/page.tsx
 * @version 1.0.0 – 2025-02-26 11:00
 * @description Страница создания компании (default locale) в кабинете пользователя.
 */

import { redirect } from 'next/navigation'

import { localizationSettings } from '@/RealizeCore/localization/config'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import CreateCompanyPage from '@/RealizeCore/ui/pages/profile/CreateCompanyPage'

export const dynamic = 'force-dynamic'

const CreateCompanyDefaultPage = async () => {
  const session = await loadAccountSession()

  if (!session) {
    redirect('/accounts/login')
  }

  return <CreateCompanyPage account={session} locale={localizationSettings.defaultLocale} />
}

export default CreateCompanyDefaultPage
