/**
 * @file src/RealizeCore/localization/ui/index.ts
 * @version 1.1.1 – 2025-12-03 20:05
 * @description
 * UI-слой локализации (словарь для интерфейса) для фронтенда Realize.
 *
 * Файл:
 * - агрегирует локализованные словари по зонам UI (header и др.);
 * - предоставляет типобезопасный доступ к строкам через getUiMessage(locale, path);
 * - не содержит React- или client-only логики (может использоваться и на сервере).
 *
 * В текущей версии:
 * - подключён словарь для шапки (headerMessages);
 * - поддерживаются ключи:
 *   - 'header.themeToggle.ariaLabel'
 *   - 'header.languageToggle.ariaLabel'
 *   - 'header.account.loginLabel'
 */

import type { PayloadLocale } from '@/RealizeCore/localization'
import { localizationSettings } from '../config'
import type { HeaderMessagesLocale, HeaderMessages } from './messages.header'
import { headerMessages } from './messages.header'
import type { AuthMessagesLocale, AuthMessages } from './messages.auth'
import { authMessages } from './messages.auth'
import type { RegisterMessagesLocale, RegisterMessages } from './messages.auth.register'
import { registerMessages } from './messages.auth.register'
import type { ForgotPasswordMessagesLocale, ForgotPasswordMessages } from './messages.auth.forgot'
import { forgotPasswordMessages } from './messages.auth.forgot'
import type { AccountNavMessagesLocale, AccountNavMessages } from './messages.accountNav'
import { accountNavMessages } from './messages.accountNav'

/**
 * @remarks
 * Базовая локаль и список поддерживаемых локалей
 * берутся из общей конфигурации локализации (config.ts),
 * чтобы UI-слой был синхронизирован с Payload.
 */
const DEFAULT_LOCALE = localizationSettings.defaultLocale
const SUPPORTED_LOCALES = localizationSettings.locales

/**
 * @remarks
 * Проверка, поддерживается ли локаль приложением.
 *
 * @param value - Строковое значение локали.
 * @returns true, если локаль присутствует в localizationSettings.locales.
 */
const isSupportedLocale = (value: string): boolean => SUPPORTED_LOCALES.includes(value)

/**
 * @remarks
 * Доступные namespace'ы UI-словаря.
 * Пока используется только 'header', но в дальнейшем могут быть:
 * - 'auth', 'srp', 'listing', 'dashboard', 'common', 'validation' и т.д.
 */
export type UiNamespaceKey = 'header' | 'auth' | 'register' | 'forgot' | 'accountNav'

/**
 * @remarks
 * Структура UI-словаря по локалям.
 * Для каждой локали описываем набор namespace'ов (header, auth, srp, ...).
 * В текущей версии подключён только header.
 */
export type UiLocale = PayloadLocale

type UiNamespaceBundle = {
  header: HeaderMessagesLocale
  auth: AuthMessagesLocale
  register: RegisterMessagesLocale
  forgot: ForgotPasswordMessagesLocale
  accountNav: AccountNavMessagesLocale
}

export type UiMessages = Record<UiLocale, UiNamespaceBundle>

/**
 * @remarks
 * Тип локали для UI-словаря.
 * Ключи верхнего уровня UiMessages.
 */
type LanguageToggleLocaleLabelPath = `header.languageToggle.localeLabels.${UiLocale}`

export type UiMessagePath =
  | 'header.themeToggle.ariaLabel'
  | 'header.languageToggle.ariaLabel'
  | 'header.languageToggle.menuLabel'
  | LanguageToggleLocaleLabelPath
  | 'header.account.loginLabel'
  | 'header.account.registerLabel'
  | 'header.account.profileLabel'
  | 'header.account.settingsLabel'
  | 'header.account.logoutLabel'
  | 'header.account.menuLabel'
  | 'header.account.signedInAs'
  | 'auth.login.title'
  | 'auth.login.subtitle'
  | 'auth.login.emailLabel'
  | 'auth.login.passwordLabel'
  | 'auth.login.forgotLink'
  | 'auth.login.submitLabel'
  | 'auth.login.submitPendingLabel'
  | 'auth.login.registerPrompt'
  | 'auth.login.registerLink'
  | 'auth.login.errorTitle'
  | 'auth.login.errorDescription'
  | 'auth.login.footerDisclaimer'
  | 'auth.login.footerConjunction'
  | 'auth.login.termsLabel'
  | 'auth.login.privacyLabel'
  | 'register.title'
  | 'register.subtitle'
  | 'register.firstName'
  | 'register.lastName'
  | 'register.email'
  | 'register.emailDescription'
  | 'register.phone'
  | 'register.password'
  | 'register.confirmPassword'
  | 'register.passwordHint'
  | 'register.termsLabel'
  | 'register.errorTitle'
  | 'register.successTitle'
  | 'register.successDescription'
  | 'register.submitLabel'
  | 'register.submitPendingLabel'
  | 'register.socialDivider'
  | 'register.socialApple'
  | 'register.socialGoogle'
  | 'register.socialMeta'
  | 'register.haveAccount'
  | 'register.loginLink'
  | 'register.footerDisclaimer'
  | 'register.footerConjunction'
  | 'register.termsLink'
  | 'register.privacyLink'
  | 'forgot.title'
  | 'forgot.subtitle'
  | 'forgot.emailLabel'
  | 'forgot.submitLabel'
  | 'forgot.submitPendingLabel'
  | 'forgot.errorTitle'
  | 'forgot.errorFallback'
  | 'forgot.successTitle'
  | 'forgot.successDescription'
  | 'forgot.rememberPrompt'
  | 'forgot.loginLink'
  | 'accountNav.dashboard'
  | 'accountNav.listings'
  | 'accountNav.favorites'
  | 'accountNav.compare'
  | 'accountNav.searches'
  | 'accountNav.plans'
  | 'accountNav.balance'
  | 'accountNav.payments'
  | 'accountNav.companies'
  | 'accountNav.notifications'
  | 'accountNav.chats'
  | 'accountNav.support'

/**
 * @remarks
 * Базовый UI-словарь по локалям.
 * Собирается из модулей вида messages.<namespace>.ts.
 *
 * В дальнейшем сюда будут добавляться новые namespace'ы:
 * - auth, srp, listing, dashboard, common, validation и т.д.
 */
const resolveNamespaceMessages = <T>(
  dictionary: Partial<Record<UiLocale, T>>,
  locale: string,
  fallbackLocale: UiLocale,
): T => {
  if (dictionary[locale as UiLocale]) {
    return dictionary[locale as UiLocale] as T
  }

  if (dictionary[fallbackLocale]) {
    return dictionary[fallbackLocale] as T
  }

  const firstEntry = Object.values(dictionary)[0]

  if (!firstEntry) {
    throw new Error('UI localization dictionary is empty')
  }

  return firstEntry
}

const buildUiMessages = (): UiMessages => {
  const fallbackLocale = DEFAULT_LOCALE as UiLocale

  return SUPPORTED_LOCALES.reduce<UiMessages>((acc, locale) => {
    const code = locale as UiLocale
    acc[code] = {
      header: resolveNamespaceMessages<HeaderMessagesLocale>(
        headerMessages as HeaderMessages,
        code,
        fallbackLocale,
      ),
      auth: resolveNamespaceMessages<AuthMessagesLocale>(
        authMessages as AuthMessages,
        code,
        fallbackLocale,
      ),
      register: resolveNamespaceMessages<RegisterMessagesLocale>(
        registerMessages as RegisterMessages,
        code,
        fallbackLocale,
      ),
      forgot: resolveNamespaceMessages<ForgotPasswordMessagesLocale>(
        forgotPasswordMessages as ForgotPasswordMessages,
        code,
        fallbackLocale,
      ),
      accountNav: resolveNamespaceMessages<AccountNavMessagesLocale>(
        accountNavMessages as AccountNavMessages,
        code,
        fallbackLocale,
      ),
    }

    return acc
  }, {} as UiMessages)
}

export const uiMessages: UiMessages = buildUiMessages()

/**
 * @remarks
 * Приведение произвольного значения локали к одному из поддерживаемых значений UiLocale.
 *
 * Алгоритм:
 * - если value не пусто и isSupportedLocale(value) === true — приводим к UiLocale;
 * - иначе возвращаем DEFAULT_LOCALE как UiLocale.
 *
 * @param value - Строковое значение локали или null/undefined.
 * @returns Корректное значение UiLocale.
 */
export const resolveUiLocale = (value: string | null | undefined): UiLocale => {
  if (value && isSupportedLocale(value)) {
    return value as UiLocale
  }

  return DEFAULT_LOCALE as UiLocale
}

/**
 * @remarks
 * Внутренний поиск значения по "пути" в словаре конкретной локали.
 *
 * @param root - Корневой объект (часть uiMessages для одной локали).
 * @param path - Путь вида 'header.themeToggle.ariaLabel'.
 * @returns Найденная строка или undefined, если ключ отсутствует.
 */
const lookupMessageByPath = (root: unknown, path: UiMessagePath): string | undefined => {
  const segments = path.split('.')
  let current: unknown = root

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * @remarks
 * Получает локализованную строку из UI-словаря.
 *
 * Логика:
 * - приводит входную locale к UiLocale через resolveUiLocale;
 * - пытается найти строку по path в словаре uiMessages[safeLocale];
 * - если по текущей локали строка не найдена — делает fallback на DEFAULT_LOCALE;
 * - если и там нет — возвращает сам path как "ключ по умолчанию".
 *
 * @param locale - Локаль, для которой нужно получить сообщение (может быть null/undefined).
 * @param path - Путь к сообщению в UI-словаре (UiMessagePath).
 * @returns Локализованная строка для указанного пути.
 *
 * @example
 * const label = getUiMessage('ru', 'header.themeToggle.ariaLabel')
 */
export const getUiMessage = (
  locale: string | null | undefined,
  path: UiMessagePath,
): string => {
  const safeLocale = resolveUiLocale(locale)

  const fromCurrent = lookupMessageByPath(uiMessages[safeLocale], path)
  if (fromCurrent !== undefined) {
    return fromCurrent
  }

  const fallbackLocale = resolveUiLocale(DEFAULT_LOCALE)

  if (fallbackLocale !== safeLocale) {
    const fromFallback = lookupMessageByPath(uiMessages[fallbackLocale], path)
    if (fromFallback !== undefined) {
      return fromFallback
    }
  }

  // Крайний случай: вернуть сам путь, чтобы было видно "дырку" в словаре.
  return path
}

export default uiMessages
