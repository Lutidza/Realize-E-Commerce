/**
 * @file src/RealizeCore/admin/Fields/LocationFields/SublocalityLevelTwoField/SublocalityLevelTwoField.ts
 * @description Relationship-поле для выбора sublocality_level_2.
 */

import type { Field, Where } from 'payload'

export const sublocalityLevelTwoField: Field = {
  name: 'sublocality_level_2',
  label: 'Sublocality Level 2',
  type: 'relationship',
  relationTo: 'administrative-areas',
  filterOptions: ({ siblingData }) => {
    const { sublocality_level_1 } = (siblingData ?? {}) as {
      sublocality_level_1?: number
    }

    const where: Where = {
      and: [
        { level: { equals: 'sublocality_level_2' } },
        ...(typeof sublocality_level_1 === 'number'
          ? [{ parent: { equals: sublocality_level_1 } }]
          : []),
        { state: { equals: 'enable' } },
      ],
    }

    return where
  },
}

export default sublocalityLevelTwoField
