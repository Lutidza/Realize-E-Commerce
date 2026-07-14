/**
 * @file src/RealizeCore/ui/components/auth/ForgotPasswordForm.tsx
 * @version 0.2.0 – 2025-12-24 04:35
 * @description
 * Форма запроса письма на восстановление пароля.
 */

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/RealizeCore/ui/components/shadcn/card"
import { Input } from "@/RealizeCore/ui/components/shadcn/input"
import { Label } from "@/RealizeCore/ui/components/shadcn/label"
import { Button } from "@/RealizeCore/ui/components/shadcn/button"
import { Alert, AlertDescription, AlertTitle } from "@/RealizeCore/ui/components/shadcn/alert"
import { formatLocalePath } from "@/RealizeCore/localization"
import { getUiMessage } from "@/RealizeCore/localization/ui"

export interface ForgotPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {
  locale?: string
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  className,
  locale = "en",
  ...props
}) => {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loginPath = formatLocalePath(locale, "/accounts/login")
  const messages = useMemo(
    () => ({
      title: getUiMessage(locale, "forgot.title"),
      subtitle: getUiMessage(locale, "forgot.subtitle"),
      emailLabel: getUiMessage(locale, "forgot.emailLabel"),
      submitLabel: getUiMessage(locale, "forgot.submitLabel"),
      submitPendingLabel: getUiMessage(locale, "forgot.submitPendingLabel"),
      errorTitle: getUiMessage(locale, "forgot.errorTitle"),
      errorFallback: getUiMessage(locale, "forgot.errorFallback"),
      successTitle: getUiMessage(locale, "forgot.successTitle"),
      successDescription: getUiMessage(locale, "forgot.successDescription"),
      rememberPrompt: getUiMessage(locale, "forgot.rememberPrompt"),
      loginLink: getUiMessage(locale, "forgot.loginLink"),
    }),
    [locale]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/accounts/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || messages.errorFallback)
      }

      setSuccess(true)
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : messages.errorFallback)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{messages.title}</h1>
              <p className="text-sm text-muted-foreground">{messages.subtitle}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{messages.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>{messages.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>{messages.successTitle}</AlertTitle>
                <AlertDescription>{messages.successDescription}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? messages.submitPendingLabel : messages.submitLabel}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {messages.rememberPrompt}{" "}
              <Link href={loginPath} className="underline underline-offset-4">
                {messages.loginLink}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordForm
