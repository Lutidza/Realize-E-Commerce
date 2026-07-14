/**
 * @file src/RealizeCore/admin/Fields/LocationFields/AddressComponentsJsonField/AddressComponentsJsonField.ts
 * @description Переиспользуемое поле адреса собранного в JSON.
 */

import { Field } from 'payload'

export const AddressComponentsJsonField: Field = {
  name: 'addressComponents',
  label: 'Address components',
  type: 'json',
}

export default AddressComponentsJsonField