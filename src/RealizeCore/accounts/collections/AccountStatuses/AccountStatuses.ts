/**
 * @file src/RealizeCore/accounts/collections/AccountStatuses/AccountStatuses.ts
 * @version 0.1.0 – 2025-12-23 22:55
 * @description
 * Directory of account statuses (pending, active, blocked etc.).
 */

import type { CollectionConfig } from 'payload'
import isDefaultCheckboxField from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/isDefaultCheckboxField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import { createEnsureSingleDefaultHook } from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/createEnsureSingleDefaultHook'

export const AccountStatusesCollection: CollectionConfig = {
  slug: 'account-statuses',
  labels: {
    singular: 'Account status',
    plural: 'Account statuses',
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
      label: 'Status label',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'value',
      label: 'Status value',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    stateField,
    isDefaultCheckboxField,
  ],
}

export default AccountStatusesCollection
