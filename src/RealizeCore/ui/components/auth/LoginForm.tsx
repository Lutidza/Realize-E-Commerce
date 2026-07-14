/**
 * @file src/RealizeCore/ui/components/auth/LoginForm.tsx
 * @version 0.2.0 – 2025-12-24 04:15
 * @description
 * Локализованная форма входа для публичных аккаунтов Realize.
 */

"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/RealizeCore/ui/components/shadcn/button"
import { Alert, AlertDescription, AlertTitle } from "@/RealizeCore/ui/components/shadcn/alert"
import { Card, CardContent } from "@/RealizeCore/ui/components/shadcn/card"
import { Input } from "@/RealizeCore/ui/components/shadcn/input"
import { Label } from "@/RealizeCore/ui/components/shadcn/label"
import { formatLocalePath } from "@/RealizeCore/localization"
import { getUiMessage } from "@/RealizeCore/localization/ui"

export interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  locale?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({ className, locale = "en", ...props }) => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const forgotPasswordPath = formatLocalePath(locale, "/accounts/forgot-password")
  const registerPath = formatLocalePath(locale, "/accounts/register")
  const termsPath = `/legal/terms`
  const privacyPath = `/legal/privacy`

  const messages = useMemo(
    () => ({
      title: getUiMessage(locale, "auth.login.title"),
      subtitle: getUiMessage(locale, "auth.login.subtitle"),
      emailLabel: getUiMessage(locale, "auth.login.emailLabel"),
      passwordLabel: getUiMessage(locale, "auth.login.passwordLabel"),
      forgotLink: getUiMessage(locale, "auth.login.forgotLink"),
      submitLabel: getUiMessage(locale, "auth.login.submitLabel"),
      submitPendingLabel: getUiMessage(locale, "auth.login.submitPendingLabel"),
      registerPrompt: getUiMessage(locale, "auth.login.registerPrompt"),
      registerLink: getUiMessage(locale, "auth.login.registerLink"),
      errorTitle: getUiMessage(locale, "auth.login.errorTitle"),
      errorFallback: getUiMessage(locale, "auth.login.errorDescription"),
      footerDisclaimer: getUiMessage(locale, "auth.login.footerDisclaimer"),
      footerConjunction: getUiMessage(locale, "auth.login.footerConjunction"),
      termsLabel: getUiMessage(locale, "auth.login.termsLabel"),
      privacyLabel: getUiMessage(locale, "auth.login.privacyLabel"),
    }),
    [locale]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const response = await fetch("/api/accounts/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || messages.errorFallback)
      }

      router.replace(formatLocalePath(locale, "/accounts/profile"))
      router.refresh()
      return
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : messages.errorFallback)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{messages.title}</h1>
                <p className="text-balance text-muted-foreground">{messages.subtitle}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{messages.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{messages.passwordLabel}</Label>
                  <Link
                    href={forgotPasswordPath}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    {messages.forgotLink}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>{messages.errorTitle}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? messages.submitPendingLabel : messages.submitLabel}
              </Button>

              <p className="text-center text-sm">
                {messages.registerPrompt}{" "}
                <Link href={registerPath} className="underline underline-offset-4">
                  {messages.registerLink}
                </Link>
              </p>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/placeholder.svg"
              alt="Background"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        {messages.footerDisclaimer}{" "}
        <Link href={termsPath}>{messages.termsLabel}</Link> {messages.footerConjunction}{" "}
        <Link href={privacyPath}>{messages.privacyLabel}</Link>.
      </p>
    </div>
  )
}

export default LoginForm
