/**
 * @file src/RealizeCore/collections/Locations/Complexes/ComplexesCollection.ts
 * @version 1.0.0 – 2025-02-14 00:00
 * @description Коллекция жилых комплексов/POI (Google types `premise`, `point_of_interest`).
 */

import type { CollectionConfig, CollectionSlug } from 'payload'

import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'

export const ComplexesCollection: CollectionConfig = {
  slug: 'complexes',
  labels: {
    singular: 'Complex / POI',
    plural: 'Complexes / POI',
  },
  admin: {
    useAsTitle: 'title',
    group: 'LOCATIONS',
    defaultColumns: ['title', 'googlePlaceId', 'parentArea', 'state'],
  },
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
      name: 'googlePlaceId',
      label: 'Google Place ID',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'types',
      label: 'Google types',
      type: 'array',
      fields: [
        {
          name: 'value',
          label: 'Type',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'parentArea',
      label: 'Parent area',
      type: 'relationship',
      relationTo: 'administrative-areas' as CollectionSlug,
      required: true,
    },
    {
      name: 'route',
      label: 'Route',
      type: 'relationship',
      relationTo: 'routes' as CollectionSlug,
    },
    {
      name: 'developer',
      label: 'Developer / Owner',
      type: 'text',
    },
    {
      name: 'meta',
      label: 'Meta',
      type: 'group',
      fields: [
        {
          name: 'numberOfBuildings',
          label: 'Number of buildings',
          type: 'number',
        },
        {
          name: 'deliveryDate',
          label: 'Delivery date',
          type: 'text',
        },
        {
          name: 'website',
          label: 'Website URL',
          type: 'text',
        },
      ],
    },
    {
      name: 'formattedAddress',
      label: 'formatted_address',
      type: 'text',
    },
    {
      name: 'addressComponents',
      label: 'Address components',
      type: 'json',
    },

    {
      name: 'searchKeywords',
      label: 'Search keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          label: 'Keyword',
          type: 'text',
        },
      ],
    },
    stateField,
  ],
}

export default ComplexesCollection
