/**
 * @file src/RealizeCore/admin/Fields/SystemFields/relatedCollectionsField/relatedCollectionsField.ts
 * @version 1.0.0
 * Унифицированное поле выбора связанных коллекций.
 */

import type { Field } from 'payload'


export const relatedCollectionsField: Field = {
  name: 'related-collections',
  label: 'Related collections',
  type: 'select',
  hasMany: false,
  options: [
    { label: 'Listings', value: 'listings' },
    { label: 'Companies', value: 'companies' },
    { label: 'Projects', value: 'projects' },
  ],
  admin: {
    position: 'sidebar'
  },
}

export default relatedCollectionsField
