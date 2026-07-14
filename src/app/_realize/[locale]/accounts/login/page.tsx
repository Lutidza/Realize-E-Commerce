import LoginForm from '@/RealizeCore/ui/components/auth/LoginForm'
import { localizationSettings } from '@/RealizeCore/localization/config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AccountsLoginPage({ params }: PageProps) {
  const { locale } = await params
  const resolvedLocale = locale ?? localizationSettings.defaultLocale

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm locale={resolvedLocale} />
      </div>
    </div>
  )
}
