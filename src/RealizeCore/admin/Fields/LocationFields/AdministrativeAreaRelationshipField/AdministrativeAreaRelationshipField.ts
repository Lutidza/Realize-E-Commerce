/**
 * @file src/RealizeCore/admin/Fields/LocationFields/AdministrativeAreaRelationshipField/AdministrativeAreaRelationshipField.ts
 * @description Базовая конфигурация relationship-поля для выбора региона (admin_area_level_2).
 */

import type { Field } from 'payload'

export const administrativeAreaRelationshipField: Field = {
  name: 'administrativeArea',
  label: 'Regions',
  type: 'relationship',
  relationTo: 'administrative-areas',
  required: true,
  filterOptions: {
    level: { equals: 'admin_area_level_2' },
    state: { equals: 'enable' },
  },
  admin: {
    description: 'Region (admin_area_level_2) that contains the city.',
  },
}

export default administrativeAreaRelationshipField
