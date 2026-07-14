/**
 * @file src/RealizeCore/collections/Attributes/AttributesGroups/AttributesGroupsCollection.ts
 * @version 1.1.0
 * @description Коллекция «Группы атрибутов» — управляет наборами атрибутов.
 */

import type { CollectionConfig } from 'payload'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import sortOrderField from '@/RealizeCore/admin/Fields/SystemFields/sortOrderField/sortOrderField'
import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import relatedCollectionsField from '@/RealizeCore/admin/Fields/SystemFields/relatedCollectionsField/relatedCollectionsField'

export const AttributesGroupsCollection: CollectionConfig = {
  slug: 'attributes-groups',
  labels: {
    singular: 'Attributes Group',
    plural: 'Attributes Groups',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'related-collections', 'state', 'order'],
    group: 'ATTRIBUTES SETTINGS',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              localized: true,
            },
            slugField,
          ],
        },
        {
          label: 'Attributes',
          fields: [
            {
              name: 'attributes',
              label: 'Attributes',
              type: 'join',
              collection: 'attributes',
              on: 'group',
              orderable: true,
              localized: true,
              admin: {
                description: 'Список атрибутов, принадлежащих этой группе.',
              },
            },
          ],
        },
      ],
    },
    stateField,
    relatedCollectionsField,
    sortOrderField,
  ],
}

export default AttributesGroupsCollection
