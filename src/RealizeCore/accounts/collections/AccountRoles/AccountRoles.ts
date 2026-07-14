/**
 * @file src/RealizeCore/accounts/AccountRoles/AccountRoles.ts
 * @version 0.1.0 – 2025-12-23 16:59
 * @description
 * Справочник ролей публичных аккаунтов (member, agent и т.д.).
 * Используется для централизованного управления доступом и связями.
 */

import type { CollectionConfig } from 'payload'
import isDefaultCheckboxField from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/isDefaultCheckboxField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import { createEnsureSingleDefaultHook } from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/createEnsureSingleDefaultHook'

/**
 * @remarks
 * Коллекция ролей аккаунтов (для admin/payload).
 */
export const AccountRolesCollection: CollectionConfig = {
  slug: 'account-roles',
  labels: {
    singular: 'Account role',
    plural: 'Account roles',
  },
  admin: {
    useAsTitle: 'label',
    group: 'ACCOUNTS',
  },
  hooks: {
    afterChange: [createEnsureSingleDefaultHook()],
  },
  fields: [
    {
      name: 'label',
      label: 'Role label',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'value',
      label: 'Role value',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    stateField,
    isDefaultCheckboxField,
  ],
}

export default AccountRolesCollection
