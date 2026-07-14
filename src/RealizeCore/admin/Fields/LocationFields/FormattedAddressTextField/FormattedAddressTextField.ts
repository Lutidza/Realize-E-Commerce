/**
 * @file src/RealizeCore/admin/Fields/LocationFields/FormattedAddressTextField/FormattedAddressTextField.ts
 * @description Переиспользуемое поле форматированного адреса.
 */

import { Field } from 'payload'

export const FormattedAddressTextField: Field = {
  name: 'formattedAddress',
  label: 'Formatted Address',
  type: 'text',
  localized: true,
}

export default FormattedAddressTextField

