/**
 * @file src/RealizeCore/accounts/collections/AccountsCollection/AccountsCollection.ts
 * @version 0.3.3 – 2025-12-24 02:55
 * @description
 * Коллекция публичных аккаунтов (используется на фронте Realize).
 * Текущая версия включает только статус и роль без связей с агентствами.
 */

import type { CollectionConfig } from 'payload'
import { resolveDisplayName } from './hooks/resolveDisplayName'
import { createDefaultRelationshipValue } from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/createDefaultRelationshipValue'

/**
 * @remarks
 * Минимальная конфигурация публичных аккаунтов (JWT для пользовательской зоны).
 */
export const AccountsCollection: CollectionConfig = {
  slug: 'accounts',
  labels: {
    singular: 'Account',
    plural: 'Accounts',
  },
  admin: {
    useAsTitle: 'email',
    group: 'ACCOUNTS',
  },
  auth: {
    verify: false,
    tokenExpiration: 60 * 60 * 12,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  fields: [
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      required: false,
      localized: true,
    },
    {
      name: 'displayName',
      label: 'Display name',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [resolveDisplayName],
      },
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'termsAccepted',
      label: 'Accepted terms of service',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      localized: true,
      admin: {
        description: 'Must be accepted before completing registration',
      },
      validate: (val) => (val ? true : 'Terms acceptance required'),
    },
    /**
     * @remarks v0.3.2
     * Поле статуса оставлено relationship; исправлена пропущенная запятая.
     */
    {
      name: 'status',
      label: 'Account status',
      type: 'relationship',
      relationTo: 'account-statuses',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      label: 'Account role',
      type: 'relationship',
      relationTo: 'account-roles',
      saveToJWT: true,
      required: true,
      admin: {
        position: 'sidebar',
      },
      defaultValue: createDefaultRelationshipValue('account-roles', {
        warnMessage: 'Default account role is missing. Please mark a role as default.',
      }),
    },
  ],
}
