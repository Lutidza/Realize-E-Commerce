/**
 * @file src/RealizeCore/admin/Fields/LocationFields/RouteField/RouteField.ts
 * @description Relationship-поле для выбора маршрута/улицы.
 */

import type { Field, Where } from 'payload'

export const routeField: Field = {
  name: 'route',
  label: 'Route',
  type: 'relationship',
  relationTo: 'routes',
  filterOptions: ({ siblingData }) => {
    const { sublocality_level_2 } = (siblingData ?? {}) as {
      sublocality_level_2?: number
    }

    const where: Where = {
      and: [
        ...(typeof sublocality_level_2 === 'number'
          ? [{ sublocality_level_2: { equals: sublocality_level_2 } }]
          : []),
      ],
    }

    return where
  },
  admin: {
    description: 'Street/route inside the selected city.',
  },
}

export default routeField
