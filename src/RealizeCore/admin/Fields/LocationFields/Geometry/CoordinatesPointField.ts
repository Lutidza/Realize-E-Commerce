/**
 * @file src/RealizeCore/admin/Fields/LocationFields/Geometry/CoordinatesPointField.ts
 * @description Переиспользуемое поле широты для геометрии.
 */

import type { Field } from 'payload'

export const CoordinatesPointField: Field = {
    name: 'coordinates',
    type: 'group',
    interfaceName: 'Coordinates',
    fields: [
      {
        name: 'coordinates',
        label: 'Coordinates',
        type: 'point',
      }
    ]
}

export default CoordinatesPointField
