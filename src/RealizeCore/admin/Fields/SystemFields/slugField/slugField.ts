/**
 * @file src/RealizeCore/admin/Fields/SystemFields/slugField/slugField.ts
 * @version 1.0.0
 * Общее селект-поле "slug" для коллекций Payload.
 */

import type { Field } from 'payload'

export const slugField: Field = {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
}

export default slugField
