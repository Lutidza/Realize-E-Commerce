/**
 * @file src/RealizeCore/admin/Fields/SystemFields/stateField/stateField.ts
 * @version 1.0.0
 * Общее селект-поле "state" для коллекций Payload.
 */

import type { Field } from 'payload'

export const stateField: Field = {
    name: 'state',
    type: 'select',
    label: 'State',
    required: true,
    defaultValue: 'disable',
    options: [
        { label: 'Enable', value: 'enable' },
        { label: 'Disable', value: 'disable' },
    ],
    admin: {
        position: 'sidebar',
    },
}

export default stateField
