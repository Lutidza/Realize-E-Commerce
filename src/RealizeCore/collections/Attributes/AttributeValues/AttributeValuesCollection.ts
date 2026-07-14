/**
 * @file src/RealizeCore/collections/Attributes/AttributeValues/AttributeValuesCollection.ts
 * @version 1.1.0 – 2025-02-18 20:30
 * Коллекция «Значения атрибутов».
 * Добавлено поле urlAlias для локализованных алиасов, используемых в SEO-URL.
 */

import type { CollectionConfig } from 'payload'

import isDefaultCheckboxField from '@/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/isDefaultCheckboxField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import sortOrderField from '@/RealizeCore/admin/Fields/SystemFields/sortOrderField/sortOrderField'
import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'

export const AttributeValuesCollection: CollectionConfig = {
  slug: 'attribute-values',
  labels: { singular: 'Attribute Value', plural: 'Attribute Values' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'attribute', 'isDefault', 'state', 'sort-order'],
    group: 'ATTRIBUTES SETTINGS',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField,
    urlAliasField({ sourceFieldPath: 'name' }),
    {
      name: 'attribute',
      type: 'relationship',
      relationTo: 'attributes',
      required: true,
      localized: true,
      admin: {
        position: 'sidebar',
      },
    },
    stateField,
    isDefaultCheckboxField,
    sortOrderField,
  ],
}

export default AttributeValuesCollection
