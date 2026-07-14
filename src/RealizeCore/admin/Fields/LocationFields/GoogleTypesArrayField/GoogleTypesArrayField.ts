/**
 * @file src/RealizeCore/admin/Fields/LocationFields/GoogleTypesArrayField/GoogleTypesArrayField.ts
 * @description Переиспользуемое поле-массив для хранения Google Types.
 */

import { Field } from 'payload'

export const GoogleTypesArrayField: Field = {
  name: 'types',
  label: 'Google types',
  type: 'array',
  fields: [
    {
      name: 'value',
      label: 'Type',
      type: 'text',
    },
  ],
}

export default GoogleTypesArrayField