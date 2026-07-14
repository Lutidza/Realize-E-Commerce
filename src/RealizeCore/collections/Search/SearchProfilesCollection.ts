/**
 * @file src/RealizeCore/collections/Search/SearchProfilesCollection.ts
 * @version 0.1.0 – 2026-02-28 09:50
 * @description Коллекция конфигураций Search Profile для управления фильтрацией и поиском.
 *
 * Последние изменения:
 * - Добавлено базовое описание коллекции Search Profile с ключевыми секциями по ТЗ.
 */

import type { CollectionConfig } from 'payload'

import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import { resolveSearchProfileFieldHook } from '@/RealizeCore/collections/Search/hooks/resolveSearchProfileFieldHook'
import { enforceSinglePublishedProfile } from '@/RealizeCore/collections/Search/hooks/enforceSinglePublishedProfile'
import { validateSearchProfileBeforeChange } from '@/RealizeCore/collections/Search/hooks/validateSearchProfileBeforeChange'

/**
 * @remarks
 * Коллекция Search Profiles описывает, как коллекции проецируются в Elasticsearch
 * и какие фасеты/фильтры доступны пользователю. Базовая структура отражает §4 ТЗ.
 */
export const SearchProfilesCollection: CollectionConfig = {
  slug: 'search-profiles',
  labels: {
    singular: 'Search Profile',
    plural: 'Search Profiles',
  },
  admin: {
    useAsTitle: 'name',
    group: 'SEARCH',
    defaultColumns: ['name', 'collectionSlug', '_status'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [enforceSinglePublishedProfile, validateSearchProfileBeforeChange],
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
              label: 'Name',
              type: 'text',
              required: true,
            },
            slugField,
            {
              name: 'collectionSlug',
              label: 'Collection',
              type: 'select',
              required: true,
              options: [
                { label: 'Listings', value: 'listings' },
                { label: 'Companies', value: 'companies' },
              ],
              admin: {
                description: 'Выберите коллекцию Payload, к которой относится профиль.',
              },
            },
            {
              name: 'indexAlias',
              label: 'Elasticsearch index alias',
              type: 'text',
              required: true,
              admin: {
                description: 'Алиас индекса ES (listings_current и т.д.).',
              },
            },
            {
              name: 'primaryKeyField',
              label: 'Primary key field',
              type: 'text',
              required: true,
              defaultValue: 'id',
              admin: {
                description: 'Поле документа в индексе, идентичное Payload primary key.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'defaultSortField',
                  label: 'Sort field',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Updated at', value: 'updatedAt' },
                    { label: 'Created at', value: 'createdAt' },
                  ],
                  defaultValue: 'updatedAt',
                },
                {
                  name: 'defaultSortDirection',
                  label: 'Direction',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Ascending', value: 'asc' },
                    { label: 'Descending', value: 'desc' },
                  ],
                  defaultValue: 'desc',
                },
              ],
            },
          ],
        },
        {
          label: 'Facets',
          fields: [
            {
              name: 'facetOverrides',
              label: 'Facet overrides',
              type: 'array',
              admin: {
                description:
                  'Базовые фасеты подтягиваются из атрибутов коллекции. Здесь задаём overrides для отдельных фасетов (counts, value source, URL).',
              },
              fields: [
                {
                  name: 'attribute',
                  label: 'Attribute',
                  type: 'relationship',
                  relationTo: 'attributes',
                  required: true,
                  admin: {
                    description: 'Атрибут, для которого требуется изменить поведение фасета.',
                  },
                  filterOptions: {
                    and: [
                      { state: { equals: 'enable' } },
                      { isFacet: { equals: true } },
                    ],
                  },
                },
                {
                  name: 'valueSource',
                  label: 'Value source',
                  type: 'select',
                  options: [
                    { label: 'Terms aggregation', value: 'terms' },
                    { label: 'Composite aggregation', value: 'composite' },
                    { label: 'Dictionary', value: 'dictionary' },
                  ],
                },
                {
                  name: 'countsMode',
                  label: 'Counts mode',
                  type: 'select',
                  options: [
                    { label: 'Disjunctive', value: 'disjunctive' },
                    { label: 'Conjunctive', value: 'conjunctive' },
                    { label: 'Lazy', value: 'lazy' },
                    { label: 'No counts', value: 'none' },
                  ],
                },
                {
                  name: 'isPinnedFacet',
                  label: 'Pinned facet (Search API)',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Отдельные подсчёты для ключевых фасетов.',
                  },
                },
                {
                  name: 'useInCardPath',
                  label: 'Use in card URL',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Если включено — сегмент участвует в URL карточек коллекции.',
                  },
                },
                {
                  name: 'isFacetInPath',
                  label: 'Facet in SRP path',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'urlOrderOverride',
                  label: 'URL order override',
                  type: 'number',
                  admin: {
                    condition: (_, data) => data?.isFacetInPath === true,
                    description: 'Если пусто, используется facetPriority из атрибута.',
                  },
                },
                {
                  name: 'urlFormatOverride',
                  label: 'URL format override',
                  type: 'select',
                  admin: {
                    condition: (_, data) => data?.isFacetInPath === true,
                  },
                  dbName: 'facet_url_fmt',
                  options: [
                    { label: 'value', value: 'value' },
                    { label: 'key-value', value: 'keyValue' },
                    { label: 'range', value: 'range' },
                  ],
                },
                {
                  name: 'showInFilterOverride',
                  label: 'Show in filter override',
                  type: 'checkbox',
                },
                {
                  name: 'uiPriorityOverride',
                  label: 'UI priority override',
                  type: 'number',
                },
                {
                  name: 'customLabel',
                  label: 'Custom label',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Query filters',
          fields: [
            {
              name: 'queryFilters',
              label: 'Query filters',
              type: 'array',
              admin: {
                description:
                  'Нефасетные фильтры, которые будут сериализоваться в query string (priceFrom, radius и др.).',
              },
              fields: [
                {
                  name: 'attribute',
                  label: 'Attribute',
                  type: 'relationship',
                  relationTo: 'attributes',
                  admin: {
                    description: 'Атрибут для query-фильтра. Оставьте пустым, если фильтр системный.',
                  },
                  filterOptions: {
                    and: [
                      { state: { equals: 'enable' } },
                    ],
                  },
                },
                {
                  name: 'key',
                  label: 'Query key',
                  type: 'text',
                  admin: {
                    description:
                      'Ключ query string. Если пусто и выбран атрибут, используется его urlAlias.',
                  },
                },
                {
                  name: 'type',
                  label: 'Filter type',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Keyword', value: 'keyword' },
                    { label: 'Text', value: 'text' },
                    { label: 'Number range', value: 'numberRange' },
                    { label: 'Date range', value: 'dateRange' },
                    { label: 'Boolean', value: 'boolean' },
                  ],
                },
                {
                  name: 'source',
                  label: 'Source path',
                  type: 'text',
                  admin: {
                    description: 'Поле индекса/документа, если отличается от атрибута.',
                  },
                },
                {
                  name: 'defaultValue',
                  label: 'Default value',
                  type: 'json',
                  admin: {
                    description: 'JSON-представление значения по умолчанию.',
                  },
                },
                {
                  name: 'customLabel',
                  label: 'Custom label',
                  type: 'text',
                  admin: {
                    description: 'Подпись фильтра (если отличается от названия атрибута).',
                  },
                },
                {
                  name: 'uiGroup',
                  label: 'UI group',
                  type: 'text',
                },
                {
                  name: 'uiComponent',
                  label: 'UI component',
                  type: 'select',
                  options: [
                    { label: 'Input', value: 'input' },
                    { label: 'Range', value: 'range' },
                    { label: 'Toggle', value: 'toggle' },
                    { label: 'Select', value: 'select' },
                  ],
                },
                {
                  name: 'isPinned',
                  label: 'Pinned in UI',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: 'Filter UI',
          fields: [
            {
              name: 'filterUiSettings',
              label: 'Filter UI settings',
              type: 'array',
              admin: {
                description:
                  'Настройки отображения фильтров: панели, виджеты, pins. Не влияет на URL или агрегации.',
              },
              fields: [
                {
                  name: 'attribute',
                  label: 'Attribute',
                  type: 'relationship',
                  relationTo: 'attributes',
                  required: true,
                  admin: {
                    description: 'Атрибут, для которого настраиваем внешний вид.',
                  },
                  filterOptions: {
                    and: [
                      { state: { equals: 'enable' } },
                      { isFacet: { equals: true } },
                    ],
                  },
                },
                {
                  name: 'panel',
                  label: 'Filter panel',
                  type: 'select',
                  options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'Modal', value: 'modal' },
                  ],
                  admin: {
                    description: 'Условная панель/группа, в которой будет отображаться фильтр.',
                  },
                },
                {
                  name: 'component',
                  label: 'Component type',
                  type: 'select',
                  options: [
                    { label: 'Checkbox list', value: 'checkbox-list' },
                    { label: 'Pills', value: 'pills' },
                    { label: 'Dropdown', value: 'dropdown' },
                    { label: 'Range slider', value: 'range-slider' },
                    { label: 'Searchable list', value: 'searchable-list' },
                  ],
                },
                {
                  name: 'uiPinned',
                  label: 'Pinned in UI',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'collapsedByDefault',
                  label: 'Collapsed by default',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'customLabel',
                  label: 'Custom label',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Limits & Controls',
          fields: [
            {
              name: 'limits',
              label: 'Limits',
              type: 'group',
              fields: [
                {
                  name: 'defaultPageSize',
                  label: 'Default page size',
                  type: 'number',
                  defaultValue: 24,
                  min: 1,
                },
                {
                  name: 'maxPageSize',
                  label: 'Max page size',
                  type: 'number',
                  defaultValue: 60,
                  min: 1,
                },
                {
                  name: 'maxFacetBuckets',
                  label: 'Max facet buckets',
                  type: 'number',
                  defaultValue: 25,
                  min: 1,
                },
                {
                  name: 'aggCountBudget',
                  label: 'Aggregation count budget',
                  type: 'number',
                  defaultValue: 5000,
                  min: 0,
                },
                {
                  name: 'bucketCountBudget',
                  label: 'Bucket count budget',
                  type: 'number',
                  defaultValue: 1000,
                  min: 0,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'resolvedProfile',
      label: 'Resolved profile',
      type: 'json',
      virtual: true,
      admin: {
        readOnly: true,
        description:
          'Автоматически собранный профиль (facets + sorts) на основе атрибутов и overrides.',
        position: 'sidebar',
      },
      hooks: {
        afterRead: [resolveSearchProfileFieldHook],
      },
    },
  ],
}

export default SearchProfilesCollection
