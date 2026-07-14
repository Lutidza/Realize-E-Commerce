/**
 * @file src/RealizeCore/collections/Attributes/Attributes/AttributesCollection.ts
 * @version 1.2.0 – 2025-02-18 20:45
 * @description Коллекция «Атрибуты» — управляет конфигурацией динамических полей.
 * Добавлено локализованное поле urlAlias для использования имени атрибута в SEO-URL.
 */

import type { CollectionConfig } from 'payload'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import sortOrderField from '@/RealizeCore/admin/Fields/SystemFields/sortOrderField/sortOrderField'
import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'


export const AttributesCollection: CollectionConfig = {
  slug: 'attributes',
  labels: {
    singular: 'Attribute',
    plural: 'Attributes',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns:  ['name', 'group', 'type', 'state', 'sort-order'],
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
              localized: true,
            },
            slugField,
            urlAliasField({
              sourceFieldPath: 'name',
            }),
            {
              name: 'localized',
              label: 'Localized labels',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable localized label/slug for this attribute.',
              },
            },
          ],
        },
        {
          label: 'Attribute values',
          fields: [
            {
              name: 'values',
              label: 'Attribute values',
              type: 'join',
              collection: 'attribute-values',
              on: 'attribute',
              orderable: true,
              admin: {
                description: 'List of values linked to this attribute (select/multiselect only).',
                condition: (_, siblingData) =>
                  ['select', 'multiselect', 'radio'].includes((siblingData?.type as string) ?? ''),
              },
            },
          ],
        },
        {
          label: 'Info',
          fields: [
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Поддерживает HTML-разметку.',
              },
            },
            {
              name: 'tooltipInfo',
              label: 'Tooltip info',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Поддерживает HTML-разметку.',
              },
            },
            {
              name: 'placeholder',
              label: 'Placeholder',
              type: 'text',
              localized: true,
            },
            {
              name: 'synonyms',
              label: 'Synonyms',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Filters',
          fields: [
            {
              name: 'isFacet',
              label: 'Use as facet',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'facetFormat',
              label: 'Facet format',
              type: 'select',
              defaultValue: 'keyValue',
              options: [
                { label: 'value', value: 'value' },
                { label: 'key-value', value: 'keyValue' },
              ],
              admin: {
                description: 'value → /{slug}, key-value → /{attribute}-{slug}.',
                condition: (_, siblingData) => siblingData?.isFacet === true,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'facetPriority',
                  label: 'Facet priority',
                  type: 'number',
                  defaultValue: 99,
                  admin: {
                    description: 'Position of this facet in URL serialization.',
                    condition: (_, siblingData) => siblingData?.isFacet === true,
                  },
                  required: true,
                },
                {
                  name: 'orderInFilter',
                  label: 'Filter order',
                  type: 'number',
                  defaultValue: 0,
                },
              ],
            },
            {
              name: 'showInFilter',
              label: 'Show in filters',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'unit',
              label: 'Unit',
              type: 'text',
              admin: {
                description: 'Unit used for integer/number range serialization.',
                condition: (_, siblingData) =>
                  ['integer', 'numberRange'].includes((siblingData?.type as string) ?? ''),
              },
            },
          ],
        },
        {
          label: 'Search',
          fields: [
            {
              name: 'isSortable',
              label: 'Use as sort option',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'sortFieldPath',
              label: 'Sort field path',
              type: 'text',
              admin: {
                description: 'Поле индекса (ES) или Payload, по которому выполняется сортировка.',
                condition: (_, siblingData) => siblingData?.isSortable === true,
              },
            },
            {
              name: 'sortDefaultDirection',
              label: 'Default sort direction',
              type: 'select',
              options: [
                { label: 'Ascending', value: 'asc' },
                { label: 'Descending', value: 'desc' },
              ],
              defaultValue: 'desc',
              admin: {
                condition: (_, siblingData) => siblingData?.isSortable === true,
              },
            },
            {
              name: 'sortLabel',
              label: 'Sort label',
              type: 'text',
              localized: true,
              admin: {
                description: 'Подпись для сортировки в UI. Если не указана, используется название атрибута.',
                condition: (_, siblingData) => siblingData?.isSortable === true,
              },
            },
          ],
        },
        {
          label: 'Validation',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'isRequired',
                  label: 'Required',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'isUnique',
                  label: 'Unique',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'isNullable',
                  label: 'Nullable',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'validationMessage',
              label: 'Validation messages',
              type: 'group',
              fields: [
                { name: 'required', label: 'Required', type: 'text' },
                { name: 'pattern', label: 'Pattern', type: 'text' },
                { name: 'range', label: 'Range', type: 'text' },
                { name: 'unique', label: 'Unique', type: 'text' },
                { name: 'custom', label: 'Custom', type: 'text' },
              ],
            },
            {
              name: 'messageSeverity',
              label: 'Message severity',
              type: 'select',
              defaultValue: 'error',
              options: [
                { label: 'Error', value: 'error' },
                { label: 'Warning', value: 'warning' },
              ],
            },
            {
              name: 'validationMode',
              label: 'Validation mode',
              type: 'select',
              defaultValue: 'onSubmit',
              options: [
                { label: 'On submit', value: 'onSubmit' },
                { label: 'On blur', value: 'onBlur' },
                { label: 'On change', value: 'onChange' },
              ],
            },
            {
              name: 'range',
              label: 'Range constraints',
              type: 'group',
              admin: {
                condition: (_, siblingData) =>
                  ['integer', 'numberRange'].includes((siblingData?.type as string) ?? ''),
              },
              fields: [
                { name: 'min', label: 'Min value', type: 'number' },
                { name: 'max', label: 'Max value', type: 'number' },
                { name: 'step', label: 'Step', type: 'number' },
              ],
            },
          ],
        },
      ],
    },
    stateField,
    {
      name: 'group',
      label: 'Group',
      type: 'relationship',
      relationTo: 'attributes-groups',
      required: true,
      admin: {
        description: 'Attribute group',
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Select', value: 'select' },
        { label: 'Multi-select', value: 'multiselect' },
        { label: 'Radio group', value: 'radio' },
        { label: 'Integer', value: 'integer' },
        { label: 'Number range', value: 'numberRange' },
        { label: 'Boolean', value: 'boolean' },
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Text', value: 'text' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    sortOrderField,
  ],
}

export default AttributesCollection
