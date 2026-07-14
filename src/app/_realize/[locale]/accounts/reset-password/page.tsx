/**
 * @file src/app/(realize)/[locale]/accounts/reset-password/page.tsx
 * @version 0.1.0 – 2025-12-24 03:58
 * @description
 * Страница сброса пароля с локализацией URL.
 */

import ResetPasswordForm from '@/RealizeCore/ui/components/auth/ResetPasswordForm'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function AccountsResetPasswordPage({ params, searchParams }: PageProps) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams])
  const resolvedLocale = locale ?? localizationSettings.defaultLocale

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <ResetPasswordForm locale={resolvedLocale} token={token} />
      </div>
    </div>
  )
}
