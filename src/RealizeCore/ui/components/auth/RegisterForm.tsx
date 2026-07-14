/**
 * @file src/RealizeCore/ui/components/auth/RegisterForm.tsx
 * @version 0.3.0 – 2025-12-24 04:30
 * @description
 * UI форма регистрации публичного аккаунта Realize.
 * Актуальная версия убирает ручной выбор локали: она выставляется автоматически.
 */

"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/RealizeCore/ui/components/shadcn/alert"
import { Button } from "@/RealizeCore/ui/components/shadcn/button"
import { Card, CardContent } from "@/RealizeCore/ui/components/shadcn/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/RealizeCore/ui/components/shadcn/field"
import { Input } from "@/RealizeCore/ui/components/shadcn/input"
import { formatLocalePath } from "@/RealizeCore/localization"
import { getUiMessage } from "@/RealizeCore/localization/ui"

export interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
  locale?: string
}

/**
 * @remarks
 * Форма регистрации аккаунта с базовой валидацией перед отправкой на Payload API.
 * @param props Свойства контейнера и локаль интерфейса.
 * @returns JSX-разметка формы регистрации.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ className, locale = "en", ...props }) => {
  const router = useRouter()
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  /**
   * @remarks
   * Обновляет локальное состояние поля формы.
   * @param event Событие изменения поля ввода.
   * @returns void
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  /**
   * @remarks
   * Отправляет данные регистрации и выполняет навигацию при успехе.
   * @param event Сабмит формы.
   * @returns Promise<void>
   */
  const messages = useMemo(
    () => ({
      title: getUiMessage(locale, "register.title"),
      subtitle: getUiMessage(locale, "register.subtitle"),
      firstName: getUiMessage(locale, "register.firstName"),
      lastName: getUiMessage(locale, "register.lastName"),
      email: getUiMessage(locale, "register.email"),
      emailDescription: getUiMessage(locale, "register.emailDescription"),
      phone: getUiMessage(locale, "register.phone"),
      password: getUiMessage(locale, "register.password"),
      confirmPassword: getUiMessage(locale, "register.confirmPassword"),
      passwordHint: getUiMessage(locale, "register.passwordHint"),
      termsLabel: getUiMessage(locale, "register.termsLabel"),
      errorTitle: getUiMessage(locale, "register.errorTitle"),
      successTitle: getUiMessage(locale, "register.successTitle"),
      successDescription: getUiMessage(locale, "register.successDescription"),
      submitLabel: getUiMessage(locale, "register.submitLabel"),
      submitPendingLabel: getUiMessage(locale, "register.submitPendingLabel"),
      socialDivider: getUiMessage(locale, "register.socialDivider"),
      socialApple: getUiMessage(locale, "register.socialApple"),
      socialGoogle: getUiMessage(locale, "register.socialGoogle"),
      socialMeta: getUiMessage(locale, "register.socialMeta"),
      haveAccount: getUiMessage(locale, "register.haveAccount"),
      loginLink: getUiMessage(locale, "register.loginLink"),
      footerDisclaimer: getUiMessage(locale, "register.footerDisclaimer"),
      footerConjunction: getUiMessage(locale, "register.footerConjunction"),
      termsLink: getUiMessage(locale, "register.termsLink"),
      privacyLink: getUiMessage(locale, "register.privacyLink"),
    }),
    [locale]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formState.password !== formState.confirmPassword) {
      setError(messages.errorTitle)
      return
    }

    setPending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/accounts/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Realize-Locale": locale,
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          firstName: formState.firstName,
          lastName: formState.lastName,
          phone: formState.phone,
          termsAccepted: formState.termsAccepted,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.message || messages.errorTitle)
      }

      const verifyBasePath = formatLocalePath(locale, "/accounts/verify")
      const verifyPath = `${verifyBasePath}?email=${encodeURIComponent(formState.email)}`
      router.push(verifyPath)
      router.refresh()
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : messages.errorTitle)
    } finally {
      setPending(false)
    }
  }

  const loginPath = formatLocalePath(locale, "/accounts/login")
  const termsPath = `/legal/terms`
  const privacyPath = `/legal/privacy`

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{messages.title}</h1>
                <p className="text-sm text-muted-foreground">{messages.subtitle}</p>
              </div>

              <Field className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">{messages.firstName}</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formState.firstName}
                    onChange={handleChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">{messages.lastName}</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formState.lastName}
                    onChange={handleChange}
                  />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">{messages.email}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleChange}
                />
                <FieldDescription>{messages.emailDescription}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">{messages.phone}</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  required
                  value={formState.phone}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <Field className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">{messages.password}</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formState.password}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">{messages.confirmPassword}</FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formState.confirmPassword}
                      onChange={handleChange}
                    />
                  </Field>
                </Field>
                <FieldDescription>{messages.passwordHint}</FieldDescription>
              </Field>

              <Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formState.termsAccepted}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border border-input"
                  />
                  {messages.termsLabel}
                </label>
              </Field>

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

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? messages.submitPendingLabel : messages.submitLabel}
                </Button>
              </Field>

              <FieldSeparator>{messages.socialDivider}</FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <span className="sr-only">{messages.socialApple}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <Button variant="outline" type="button">
                  <span className="sr-only">{messages.socialGoogle}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <Button variant="outline" type="button">
                  <span className="sr-only">{messages.socialMeta}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843.34-.288.62-.616.81-.973.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {messages.haveAccount} <Link href={loginPath}>{messages.loginLink}</Link>
              </FieldDescription>
            </FieldGroup>
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
        {messages.footerDisclaimer} <Link href={termsPath}>{messages.termsLink}</Link>{" "}
        {messages.footerConjunction} <Link href={privacyPath}>{messages.privacyLink}</Link>.
      </p>
    </div>
  )
}

export default RegisterForm
