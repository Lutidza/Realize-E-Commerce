/**
 * @file src/app/(realize)/(default)/accounts/forgot-password/page.tsx
 * @version 0.1.0 – 2025-12-24 04:05
 * @description
 * Страница восстановления пароля для default маршрута.
 */

import ForgotPasswordForm from '@/RealizeCore/ui/components/auth/ForgotPasswordForm'
import { localizationSettings } from '@/RealizeCore/localization/config'

export const dynamic = 'force-dynamic'

export default function DefaultAccountsForgotPasswordPage() {
  const locale = localizationSettings.defaultLocale

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <ForgotPasswordForm locale={locale} />
      </div>
    </div>
  )
}
