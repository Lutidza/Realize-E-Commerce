/**
 * @file src/app/(realize)/[locale]/accounts/companies/create/page.tsx
 * @version 1.0.0 – 2025-02-26 11:00
 * @description Страница создания компании в локализованном кабинете пользователя.
 */

import { redirect } from 'next/navigation'

import { localizationSettings } from '@/RealizeCore/localization/config'
import { loadAccountSession } from '@/RealizeCore/services/auth/loadAccountSession'
import CreateCompanyPage from '@/RealizeCore/ui/pages/profile/CreateCompanyPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
}

const CreateCompanyPageLocale = async ({ params }: PageProps) => {
  const { locale } = await params
  const session = await loadAccountSession()

  if (!session) {
    redirect(`/${locale ?? localizationSettings.defaultLocale}/accounts/login`)
  }

  const resolvedLocale = locale ?? localizationSettings.defaultLocale

  return <CreateCompanyPage account={session!} locale={resolvedLocale} />
}

export default CreateCompanyPageLocale
