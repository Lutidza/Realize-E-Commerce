/**
 * @file src/RealizeCore/collections/Companies/CompaniesCollection.ts
 * @version 1.0.0 – 2025-02-26 10:35
 * @description Конфигурация коллекции компаний (агентства, застройщики).
 *
 * Поля включают юридическую форму, тип компании, контактную информацию и ссылки.
 */

import type { CollectionConfig } from 'payload'

import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'
import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import { administrativeAreaRelationshipField } from '@/RealizeCore/admin/Fields/LocationFields/AdministrativeAreaRelationshipField/AdministrativeAreaRelationshipField'
import { CityRelationshipField } from '@/RealizeCore/admin/Fields/LocationFields/CityRelationshipField/CityRelationshipField'
import { createSyncAttributeSelectionsAfterChange } from '@/RealizeCore/data/attributes/hooks/syncAttributeSelectionsAfterChange'
import { createCleanupAttributeRelationsAfterDelete } from '@/RealizeCore/data/attributes/hooks/createCleanupAttributeRelationsAfterDelete'
import {
  createQueueSearchIndexAfterChangeHook,
  createQueueSearchIndexAfterDeleteHook,
} from '@/RealizeCore/services/search/jobs/hooks/queueSearchIndexJob'
import { COMPANY_SEARCH_TASK } from '@/RealizeCore/services/search/jobs/tasks/searchIndexTasks'

export const CompaniesCollection: CollectionConfig = {
  slug: 'companies',
  labels: {
    singular: 'Company',
    plural: 'Companies',
  },
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'city'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'legalName',
              label: 'Legal name',
              type: 'text',
              required: true,
            },
            {
              name: 'companyName',
              label: 'Company name',
              type: 'text',
              required: true,
            },
            slugField,
            urlAliasField({ sourceFieldPath: 'companyName' }),
            {
              name: 'identCode',
              label: 'Identification code',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Contacts',
          fields: [
            {
              name: 'phone',
              label: 'Phone',
              type: 'text',
            },
            {
              name: 'additionalPhone',
              label: 'Additional phone',
              type: 'text',
            },
            {
              name: 'website',
              label: 'Website',
              type: 'text',
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            administrativeAreaRelationshipField,
            CityRelationshipField,
            {
              name: 'address',
              label: 'Address',
              type: 'text',
            },
          ],
        },
        {
          label: 'Attributes',
          fields: [
            {
              name: 'attributeSelectionsData',
              type: 'json',
              admin: {
                components: {
                  Field: {
                    path: '@/RealizeCore/admin/Fields/AttributesFields/index.AttributesFields',
                    clientProps: {
                      targetCollection: 'companies',
                    },
                  },
                },
              },
              defaultValue: {},
            },
          ],
        },
      ],
    },
    stateField,
  ],
  hooks: {
    afterChange: [
      createSyncAttributeSelectionsAfterChange({ collectionSlug: 'companies' }),
      createQueueSearchIndexAfterChangeHook(COMPANY_SEARCH_TASK),
    ],
    afterDelete: [
      createCleanupAttributeRelationsAfterDelete({ collectionSlug: 'companies' }),
      createQueueSearchIndexAfterDeleteHook(COMPANY_SEARCH_TASK),
    ],
  },
}

export default CompaniesCollection
