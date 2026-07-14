/**
 * @file src/RealizeCore/services/auth/loadAccountSession.ts
 * @version 0.1.0 – 2025-12-24 03:52
 * @description
 * Server-side helper to fetch current account session from Payload via internal API.
 */

import { headers } from 'next/headers'

import type { Account } from '@/payload-types'

const resolveBaseUrl = async () => {
  const envUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL
  if (envUrl) return envUrl.replace(/\/$/, '')

  const headerStore = await headers()
  const host = headerStore.get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
  return `${protocol}://${host}`
}

/**
 * @remarks
 * Возвращает аккаунт из текущей сессии или null, если пользователь не авторизован.
 * @returns Объект Account или null.
 */
export const loadAccountSession = async (): Promise<Account | null> => {
  const headerStore = await headers()
  const cookieHeader = headerStore.get('cookie') ?? ''
  const baseUrl = await resolveBaseUrl()

  try {
    const response = await fetch(`${baseUrl}/api/accounts/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!response.ok) {
      return null
    }
    const data = await response.json().catch(() => ({ user: null }))
    return (data?.user as Account | undefined) ?? null
  } catch {
    return null
  }
}

export default loadAccountSession
