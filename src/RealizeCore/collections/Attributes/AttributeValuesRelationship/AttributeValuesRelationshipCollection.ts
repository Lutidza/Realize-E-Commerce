/**
 * @file src/RealizeCore/collections/Attributes/AttributeValuesRelationshipCollection.ts
 * @version 1.0.0
 * @description Пивот-таблица для хранения значений атрибутов у объявлений.
 */

import type { CollectionConfig } from 'payload'

export const AttributeValuesRelationshipCollection: CollectionConfig = {
  slug: 'attribute-values-relationship',
  admin: {
    useAsTitle: 'docId',
    defaultColumns: ['collectionSlug', 'docId', 'attribute', 'value'],
    group: 'ATTRIBUTES SETTINGS',
  },
  fields: [
    {
      name: 'collectionSlug',
      type: 'text',
      label: 'Collection slug',
      required: true,
    },
    {
      name: 'docId',
      type: 'number',
      label: 'Document ID',
      required: true,
    },
    {
      name: 'attribute',
      type: 'relationship',
      relationTo: 'attributes',
      required: true,
    },
    {
      name: 'value',
      type: 'relationship',
      relationTo: 'attribute-values',
    },
    {
      name: 'intValue',
      type: 'number',
    },
    {
      name: 'rangeFrom',
      type: 'number',
    },
    {
      name: 'rangeTo',
      type: 'number',
    },
    {
      name: 'boolValue',
      type: 'checkbox',
    },
    {
      name: 'textValue',
      type: 'text',
    },
  ],
}

export default AttributeValuesRelationshipCollection
