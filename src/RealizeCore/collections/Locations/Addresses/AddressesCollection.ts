/**
 * @file src/RealizeCore/collections/Locations/Addresses/AddressesCollection.ts
 * @version 1.0.0 – 2025-02-14 00:00
 * @description Коллекция адресов (дом/корпус) для хранения street_number/subpremise.
 */

import type { CollectionConfig, CollectionSlug } from 'payload'

import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'

export const AddressesCollection: CollectionConfig = {
  slug: 'addresses',
  labels: {
    singular: 'Address',
    plural: 'Addresses',
  },
  admin: {
    useAsTitle: 'title',
    group: 'LOCATIONS',
    defaultColumns: ['title', 'route', 'parentArea', 'state'],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      admin: {
        description: 'Отображаемое название (например, «Дом 12»).',
      },
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
      name: 'route',
      label: 'Route',
      type: 'relationship',
      relationTo: 'routes' as CollectionSlug,
      required: true,
    },
    {
      name: 'parentArea',
      label: 'Parent area',
      type: 'relationship',
      relationTo: 'administrative-areas' as CollectionSlug,
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'streetNumber',
          label: 'Street number',
          type: 'text',
        },
        {
          name: 'subpremise',
          label: 'Subpremise / building',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'entrance',
          label: 'Entrance',
          type: 'text',
        },
        {
          name: 'buildingName',
          label: 'Building name',
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
      name: 'additionalNotes',
      label: 'Additional notes',
      type: 'textarea',
    },
    stateField,
  ],
}

export default AddressesCollection
