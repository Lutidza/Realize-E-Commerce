/**
 * @file src/RealizeCore/accounts/collections/hooks/resolveDisplayName.ts
 * @version 0.1.0 – 2025-12-23 05:17
 * @description
 * Field-level hook для вычисления displayName на основе firstName/lastName.
 *
 * Последние изменения:
 * - Вынесен из AccountsCollection в отдельный модуль hooks.
 */

import type { FieldHook } from 'payload'

/**
 * @remarks
 * Формирует displayName на основе firstName + lastName.
 *
 * @param args.data - Документ целиком.
 * @returns Готовая строка или null, если оба поля пустые.
 */
export const resolveDisplayName: FieldHook = ({ data }) => {
  const firstName = typeof data?.firstName === 'string' ? data.firstName.trim() : ''
  const lastName = typeof data?.lastName === 'string' ? data.lastName.trim() : ''
  if (!firstName && !lastName) return null
  return [firstName, lastName].filter(Boolean).join(' ')
}

export default resolveDisplayName
