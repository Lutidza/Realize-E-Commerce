/**
 * @file src/app/(realize)/(default)/accounts/verify/page.tsx
 * @version 0.1.0 – 2025-12-24 03:05
 * @description
 * Дефолтная страница подтверждения email для аккаунтов без явного сегмента локали.
 */

import Link from 'next/link'

import { localizationSettings } from '@/RealizeCore/localization/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/RealizeCore/ui/components/shadcn/card'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'

interface PageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function DefaultAccountsVerifyEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams
  const emailLabel = email ?? 'your email address'
  const loginPath = `/accounts/login`
  const locale = localizationSettings.defaultLocale

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            An activation link has been sent to your email address:{' '}
            <span className="font-medium">{emailLabel}</span>. Please check your inbox and click on
            the link to complete the activation process.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>If you can&apos;t find the email, check your spam folder or request a new link.</p>
          </div>
          <Button asChild>
            <Link href={loginPath} locale={locale}>
              Return to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
