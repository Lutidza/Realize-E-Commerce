/**
 * @file src/RealizeCore/services/auth/accountsAuthService.ts
 * @version 0.3.8 – 2025-12-24 02:55
 * @description
 * Service helpers over Payload local API for account authentication.
 * Обновлено для корректной работы со статусами и локалями без участия UI.
 */

import payloadConfigPromise from '@payload-config'
import { getPayload, ValidationError } from 'payload'

import type { Account, AccountRole, AccountStatus, Config } from '@/payload-types'
import { localizationSettings } from '@/RealizeCore/localization/config'

const ACCOUNTS_COLLECTION = 'accounts'
const ROLES_COLLECTION = 'account-roles'
const STATUSES_COLLECTION = 'account-statuses'

const DEFAULT_CACHE_TTL = 5 * 60 * 1000
const defaultCache = new Map<string, { value: number; expiresAt: number }>()

/**
 * @remarks
 * Возвращает клиент Payload для локального API.
 * @returns Экземпляр Payload локального API.
 */
const getPayloadClient = async () => {
  const config = await payloadConfigPromise
  return getPayload({ config })
}

/**
 * @remarks
 * Ищет ID роли, помеченной как дефолтная и включённая.
 * @returns ID роли или null, если дефолт не настроен.
 */
const getDefaultRoleId = async (): Promise<AccountRole['id'] | null> => {
  const cached = defaultCache.get(ROLES_COLLECTION)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.value
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: ROLES_COLLECTION,
    where: {
      and: [
        { isDefault: { equals: true } },
        { state: { equals: 'enable' } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const role = docs[0] as AccountRole | undefined
  if (!role) {
    return null
  }

  defaultCache.set(ROLES_COLLECTION, {
    value: role.id,
    expiresAt: now + DEFAULT_CACHE_TTL,
  })

  return role.id
}

/**
 * @remarks
 * Ищет ID статуса, помеченного как дефолтный и включённый.
 * @returns ID статуса или null.
 */
const getDefaultStatusId = async (): Promise<AccountStatus['id'] | null> => {
  const cached = defaultCache.get(STATUSES_COLLECTION)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.value as AccountStatus['id']
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: STATUSES_COLLECTION,
    where: {
      and: [
        { isDefault: { equals: true } },
        { state: { equals: 'enable' } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const status = docs[0] as AccountStatus | undefined
  if (!status) {
    return null
  }

  defaultCache.set(STATUSES_COLLECTION, {
    value: status.id,
    expiresAt: now + DEFAULT_CACHE_TTL,
  })

  return status.id
}

/**
 * @remarks
 * Находит ID статуса по его строковому value.
 * @param value Значение статуса (например, 'pending').
 * @returns ID статуса или null, если не найден.
 */
const getStatusIdByValue = async (value: AccountStatus['value']) => {
  const cacheKey = `${STATUSES_COLLECTION}:${value}`
  const cached = defaultCache.get(cacheKey)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.value as AccountStatus['id']
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: STATUSES_COLLECTION,
    where: {
      and: [
        { value: { equals: value } },
        { state: { equals: 'enable' } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const status = docs[0] as AccountStatus | undefined
  if (!status) {
    return null
  }

  defaultCache.set(cacheKey, {
    value: status.id,
    expiresAt: now + DEFAULT_CACHE_TTL,
  })

  return status.id
}

/**
 * @remarks
 * Приводит входящий статус к ID, поддерживая строки, объекты и отсутствие.
 * @param statusInput Значение статуса в любом поддерживаемом формате.
 * @returns ID статуса или null.
 */
const resolveStatusId = async (
  statusInput?: AccountStatus['id'] | AccountStatus['value'] | AccountStatus | null,
) => {
  if (!statusInput) {
    return getDefaultStatusId()
  }

  if (typeof statusInput === 'object') {
    return statusInput.id
  }

  if (typeof statusInput === 'number') {
    return statusInput
  }

  const statusId = await getStatusIdByValue(statusInput)
  if (statusId) {
    return statusId
  }

  return getDefaultStatusId()
}

type RegisterAccountInput = Pick<
  Account,
  'email' | 'firstName' | 'lastName' | 'phone' | 'termsAccepted'
> & {
  password: string
  status?: AccountStatus['id'] | AccountStatus['value'] | AccountStatus | null
}

type SupportedLocale = Config['locale']

type RegisterAccountOptions = {
  locale?: SupportedLocale | null
}

/**
 * @remarks
 * Создаёт новый аккаунт в Payload, подставляя дефолтные роль/статус/локаль.
 * @param data Поля аккаунта и пароль.
 * @returns Созданный аккаунт.
 */
export const registerAccount = async (data: RegisterAccountInput, options?: RegisterAccountOptions) => {
  const payload = await getPayloadClient()
  const fallbackLocale = localizationSettings.defaultLocale as SupportedLocale
  const targetLocale = options?.locale ?? fallbackLocale

  const [defaultRoleId, resolvedStatusId] = await Promise.all([
    getDefaultRoleId(),
    resolveStatusId(data.status),
  ])

  if (!defaultRoleId) {
    throw new Error('Default account role is missing. Please configure account roles in admin.')
  }

  const createData: Omit<RegisterAccountInput, 'password' | 'status'> & {
    password: string
    role: AccountRole['id']
    status?: AccountStatus['id']
  } = {
    ...data,
    role: defaultRoleId,
    status: resolvedStatusId ?? undefined,
  }

  try {
    const account = await payload.create({
      collection: ACCOUNTS_COLLECTION,
      locale: targetLocale ?? localizationSettings.defaultLocale,
      data: createData,
    })

    return account as Account
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      const fieldError = error.data?.errors?.[0]
      if (fieldError?.message) {
        throw new Error(fieldError.message)
      }
    }

    throw error
  }
}

/**
 * @remarks
 * Выполняет вход аккаунта через Payload.
 * @param email Email аккаунта.
 * @param password Пароль аккаунта.
 * @returns Пользователь, токен и время истечения.
 */
export const loginAccount = async (email: string, password: string) => {
  const payload = await getPayloadClient()
  const result = await payload.login({
    collection: ACCOUNTS_COLLECTION,
    data: { email, password },
  })

  return {
    user: result.user as Account,
    token: result.token,
    exp: result.exp,
  }
}

/**
 * @remarks
 * Запускает процедуру восстановления пароля.
 * @param email Email аккаунта.
 * @returns Promise<void>
 */
export const requestPasswordReset = async (email: string) => {
  const payload = await getPayloadClient()
  await payload.forgotPassword({
    collection: ACCOUNTS_COLLECTION,
    data: { email },
  })
}

/**
 * @remarks
 * Сбрасывает пароль по токену.
 * @param token Токен сброса.
 * @param password Новый пароль.
 * @returns Promise<void>
 */
export const resetAccountPassword = async (token: string, password: string) => {
  const payload = await getPayloadClient()
  await payload.resetPassword({
    collection: ACCOUNTS_COLLECTION,
    data: { token, password },
    overrideAccess: true,
  })
}

/**
 * @remarks
 * Подтверждает email аккаунта.
 * @param token Токен верификации.
 * @returns Объект результата верификации.
 */
export const verifyAccountEmail = async (token: string) => {
  const payload = await getPayloadClient()
  return payload.verifyEmail({
    collection: ACCOUNTS_COLLECTION,
    token,
  })
}
