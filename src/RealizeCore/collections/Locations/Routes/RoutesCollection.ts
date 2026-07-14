/**
 * @file src/RealizeCore/collections/Locations/Routes/RoutesCollection.ts
 * @version 1.0.0 – 2025-02-14 00:00
 * @description Коллекция маршрутов/улиц (Google type `route`).
 */

import type { CollectionConfig } from 'payload'

import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'
import administrativeAreaRelationshipField from '@/RealizeCore/admin/Fields/LocationFields/AdministrativeAreaRelationshipField/AdministrativeAreaRelationshipField'
import CityRelationshipField  from '@/RealizeCore/admin/Fields/LocationFields/CityRelationshipField/CityRelationshipField'
import sublocalityLevelOneField from '@/RealizeCore/admin/Fields/LocationFields/SublocalityLevelOneField/SublocalityLevelOneField'
import sublocalityLevelTwoField from '@/RealizeCore/admin/Fields/LocationFields/SublocalityLevelTwoField/SublocalityLevelTwoField'
import CoordinatesPointField from '@/RealizeCore/admin/Fields/LocationFields/Geometry/CoordinatesPointField'
import FormattedAddressTextField from '@/RealizeCore/admin/Fields/LocationFields/FormattedAddressTextField/FormattedAddressTextField'
import AddressComponentsJsonField from '@/RealizeCore/admin/Fields/LocationFields/AddressComponentsJsonField/AddressComponentsJsonField'
import GoogleTypesArrayField from '@/RealizeCore/admin/Fields/LocationFields/GoogleTypesArrayField/GoogleTypesArrayField'
import GooglePlaceTextField from '@/RealizeCore/admin/Fields/LocationFields/GooglePlaceIDTextField/GooglePlaceIDTextField'
import SearchKeywordsArrayField from '@/RealizeCore/admin/Fields/SeoFields/SearchKeywordsArrayField/SearchKeywordsArrayField'


export const RoutesCollection: CollectionConfig = {
  slug: 'routes',
  labels: {
    singular: 'Route',
    plural: 'Routes',
  },
  admin: {
    useAsTitle: 'title',
    group: 'LOCATIONS',
    defaultColumns: ['title', 'streetType', 'parentArea', 'state'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Information',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              localized: true,
              required: true,
            },
            slugField,
            urlAliasField({ sourceFieldPath: 'title' }),
            {
              name: 'streetType',
              label: 'Street type',
              type: 'select',
              options: [
                { label: 'Street', value: 'street' },
                { label: 'Avenue', value: 'avenue' },
                { label: 'Boulevard', value: 'boulevard' },
                { label: 'Highway', value: 'highway' },
                { label: 'Square', value: 'square' },
                { label: 'Lane', value: 'lane' },
                { label: 'Drive', value: 'drive' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'other',
            },
          ],
        },
        {
          label: 'Locations',
          fields: [
            administrativeAreaRelationshipField,
            CityRelationshipField,
            sublocalityLevelOneField,
            sublocalityLevelTwoField,
            FormattedAddressTextField,
            {
              name: 'nameParts',
              label: 'Name parts',
              type: 'group',
              admin: {
                description: 'Дополнительные части названия (ул., просп., и т.д.).',
              },
              fields: [
                {
                  name: 'prefix',
                  label: 'Prefix',
                  type: 'text',
                },
                {
                  name: 'baseName',
                  label: 'Base name',
                  type: 'text',
                },
                {
                  name: 'suffix',
                  label: 'Suffix',
                  type: 'text',
                },
              ],
            },
            {
              name: 'qualifier',
              label: 'Qualifier',
              type: 'group',
              admin: {
                description: 'Доп. маркеры (тупик, переулок, микрорайон) и их номер.',
              },
              fields: [
                {
                  name: 'kind',
                  label: 'Kind',
                  type: 'select',
                  options: [
                    { label: 'Dead End / тупик', value: 'tupik' },
                    { label: 'Lane / переулок', value: 'lane' },
                    { label: 'Microdistrict', value: 'microdistrict' },
                  ],
                },
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                },
                {
                  name: 'value',
                  label: 'Numeric value',
                  type: 'number',
                },
              ],
            },
            CoordinatesPointField,
            AddressComponentsJsonField,
          ],
        },
        {
          label: 'SEO',
          fields: [
            SearchKeywordsArrayField,
          ]
        },
        {
          label: 'Google',
          fields: [
            GooglePlaceTextField,
            GoogleTypesArrayField,
          ]
        },
      ],
    },
    stateField,
  ],
}

export default RoutesCollection
