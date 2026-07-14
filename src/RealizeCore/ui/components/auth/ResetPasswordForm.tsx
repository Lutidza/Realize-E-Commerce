/**
 * @file src/RealizeCore/ui/components/auth/ResetPasswordForm.tsx
 * @version 0.1.0 – 2025-12-24 03:58
 * @description
 * Форма сброса пароля аккаунта по токену из email.
 */

"use client"

import Link from "next/link"
import { useState } from "react"

import { formatLocalePath } from "@/RealizeCore/localization"
import { Button } from "@/RealizeCore/ui/components/shadcn/button"
import { Card, CardContent } from "@/RealizeCore/ui/components/shadcn/card"
import { Input } from "@/RealizeCore/ui/components/shadcn/input"
import { Label } from "@/RealizeCore/ui/components/shadcn/label"
import { Alert, AlertDescription, AlertTitle } from "@/RealizeCore/ui/components/shadcn/alert"
import { cn } from "@/lib/utils"

export interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {
  token?: string
  locale?: string
}

/**
 * @remarks
 * Отображает поля для нового пароля и вызывает API сброса.
 * @param props.token Токен из email.
 * @param props.locale Текущая локаль для ссылок.
 * @returns JSX формы.
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  className,
  token,
  locale = "en",
  ...props
}) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loginPath = formatLocalePath(locale, "/accounts/login")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setError("Reset token is missing or invalid.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setPending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/accounts/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || "Unable to reset password.")
      }

      setSuccess(true)
      setPassword("")
      setConfirmPassword("")
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password.")
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
              <h1 className="text-2xl font-bold">Set a new password</h1>
              <p className="text-sm text-muted-foreground">
                Enter and confirm your new password to finish the reset process.
              </p>
            </div>

            {!token && (
              <Alert variant="destructive">
                <AlertTitle>Invalid link</AlertTitle>
                <AlertDescription>
                  The reset link is missing or has expired. Please request a new email.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Unable to reset password</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>Password updated</AlertTitle>
                <AlertDescription>
                  You can now <Link href={loginPath}>sign in</Link> with your new password.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={pending || !token}>
              {pending ? "Saving..." : "Save password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPasswordForm
