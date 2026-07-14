/**
 * @file src/RealizeCore/admin/Fields/SystemFields/sortOrderField/sortOrderField.ts
 * @version 1.0.0
 * Общее селект-поле "sortOrder" для коллекций Payload.
 */

import type { Field } from 'payload'

export const sortOrderField: Field = {
    name: 'sort-order',
    type: 'number',
    label: 'Sort Order',
    required: true,
    defaultValue: 0,
    admin: {
        position: 'sidebar',
    },
}

export default sortOrderField
