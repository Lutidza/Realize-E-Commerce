/**
 * @file src/RealizeCore/admin/Fields/LocationFields/CityRelationshipField/CityRelationshipField.ts
 * @description Конфигурация relationship-поля города.
 */

import type { Field, Where } from 'payload'

export const CityRelationshipField: Field = {
  name: 'city',
  label: 'City',
  type: 'relationship',
  relationTo: 'administrative-areas',
  required: true,
  filterOptions: ({ siblingData }) => {
    const { administrativeArea } = (siblingData ?? {}) as {
      administrativeArea?: number
    }

    const where: Where = {
      and: [
        { level: { equals: 'locality' } },
        ...(typeof administrativeArea === 'number' ? [{ parent: { equals: administrativeArea } }] : []),
        { state: { equals: 'enable' } },
      ],
    }

    return where
  },
  admin: {
    description: 'City with locality level.',
  },
}

export default CityRelationshipField
