/**
 * @file src/RealizeCore/collections/Locations/AdministrativeAreas/AdministrativeAreasCollection.ts
 * @version 1.0.0 – 2025-02-14 00:00
 * @description Универсальная коллекция административных уровней на основе Google Places.
 */

import type { CollectionConfig } from 'payload'

import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'
import GooglePlaceTextField from '@/RealizeCore/admin/Fields/LocationFields/GooglePlaceIDTextField/GooglePlaceIDTextField'
import GoogleTypesArrayField from '@/RealizeCore/admin/Fields/LocationFields/GoogleTypesArrayField/GoogleTypesArrayField'
import SearchKeywordsArrayField from '@/RealizeCore/admin/Fields/SeoFields/SearchKeywordsArrayField/SearchKeywordsArrayField'
import CoordinatesPointField from '@/RealizeCore/admin/Fields/LocationFields/Geometry/CoordinatesPointField'
import AddressComponentsJsonField from '@/RealizeCore/admin/Fields/LocationFields/AddressComponentsJsonField/AddressComponentsJsonField'

export const AdministrativeAreasCollection: CollectionConfig = {
  slug: 'administrative-areas',
  labels: {
    singular: 'Administrative area',
    plural: 'Administrative areas',
  },
  admin: {
    useAsTitle: 'title',
    group: 'LOCATIONS',
    defaultColumns: ['title', 'level', 'googlePlaceId', 'parent', 'state'],
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
              name: 'level',
              label: 'Administrative level',
              type: 'select',
              required: true,
              options: [
                { label: 'Country', value: 'country' },
                { label: 'Admin Area Level 1', value: 'admin_area_level_1' },
                { label: 'Admin Area Level 2', value: 'admin_area_level_2' },
                { label: 'Locality', value: 'locality' },
                { label: 'Sublocality Level 1', value: 'sublocality_level_1' },
                { label: 'Sublocality Level 2', value: 'sublocality_level_2' },
                { label: 'Neighborhood', value: 'neighborhood' },
              ],
            },
          ],
        },
        {
          label: 'Locations',
          fields: [
            {
              name: 'parent',
              label: 'Parent area',
              type: 'relationship',
              relationTo: 'administrative-areas',
              admin: {
                description: 'Ссылка на вышестоящий административный уровень.',
              },
            },
            {
              name: 'countryCode',
              label: 'Country code',
              type: 'text',
              admin: {
                description: 'ISO код страны (например, GE, US).',
              },
            },
            CoordinatesPointField,
            AddressComponentsJsonField,
          ]
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
        }
      ],
    },
    stateField,
    {
      name: 'source',
      label: 'Data source',
      type: 'select',
      options: [
        { label: 'Import', value: 'import' },
        { label: 'Manual', value: 'manual' },
        { label: 'Google', value: 'google' },
      ],
      admin: {
        position: 'sidebar',
      }
    },
  ],
}

export default AdministrativeAreasCollection
