/**
 * @file src/RealizeCore/admin/Fields/LocationFields/GooglePlaceTextField/GooglePlaceTextField.ts
 * @description Переиспользуемое поле адреса в JSON.
 */

import { Field } from 'payload'

export const GooglePlaceTextField: Field = {
  name: 'googlePlaceId',
  label: 'Google Place ID',
  type: 'text',
  unique: true,
}

export default GooglePlaceTextField