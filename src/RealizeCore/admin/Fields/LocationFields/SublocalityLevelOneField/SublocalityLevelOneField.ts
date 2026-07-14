/**
 * @file src/RealizeCore/admin/Fields/LocationFields/SublocalityLevelOneField/SublocalityLevelOneField.ts
 * @description Relationship-поле для выбора sublocality_level_1.
 */

import type { Field, Where } from 'payload'

export const sublocalityLevelOneField: Field = {
  name: 'sublocality_level_1',
  label: 'Sublocality Level 1',
  type: 'relationship',
  relationTo: 'administrative-areas',
  filterOptions: ({ siblingData }) => {
    const { city } = (siblingData ?? {}) as {
      city?: number
    }

    const where: Where = {
      and: [
        { level: { equals: 'sublocality_level_1' } },
        ...(typeof city === 'number' ? [{ parent: { equals: city } }] : []),
        { state: { equals: 'enable' } },
      ],
    }

    return where
  },
}

export default sublocalityLevelOneField
