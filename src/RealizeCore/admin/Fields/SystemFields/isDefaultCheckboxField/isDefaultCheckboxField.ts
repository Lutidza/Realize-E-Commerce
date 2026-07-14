/**
 * @file src/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/isDefaultCheckboxField.ts
 * @version 1.0.0 – 2025-02-18 17:30
 * @description Чекбокс «значение по умолчанию» для коллекций атрибутов.
 */

import type { Field } from 'payload'

export const isDefaultCheckboxField: Field = {
  name: 'isDefault',
  label: 'Default value',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Marks entry as the preferred default option.',
    position: 'sidebar',
  },
}

export default isDefaultCheckboxField
