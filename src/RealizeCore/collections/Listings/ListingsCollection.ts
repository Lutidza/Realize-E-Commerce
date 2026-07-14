/**
 * @file src/RealizeCore/collections/Listings/ListingsCollection.ts
 * @version 1.4.0 – 2025-02-25 00:40
 * @description Коллекция объявлений с кастомным полем атрибутов.
 */

import type { CollectionConfig } from 'payload'

import { createCleanupAttributeRelationsAfterDelete } from '@/RealizeCore/data/attributes/hooks/createCleanupAttributeRelationsAfterDelete'
import { createSyncAttributeSelectionsAfterChange } from '@/RealizeCore/data/attributes/hooks/syncAttributeSelectionsAfterChange'
import urlAliasField from '@/RealizeCore/admin/Fields/SystemFields/urlAliasField/urlAliasField'
import stateField from '@/RealizeCore/admin/Fields/SystemFields/stateField/stateField'
import slugField from '@/RealizeCore/admin/Fields/SystemFields/slugField/slugField'
import { administrativeAreaRelationshipField } from '@/RealizeCore/admin/Fields/LocationFields/AdministrativeAreaRelationshipField/AdministrativeAreaRelationshipField'
import { CityRelationshipField } from '@/RealizeCore/admin/Fields/LocationFields/CityRelationshipField/CityRelationshipField'
import { sublocalityLevelOneField } from '@/RealizeCore/admin/Fields/LocationFields/SublocalityLevelOneField/SublocalityLevelOneField'
import { sublocalityLevelTwoField } from '@/RealizeCore/admin/Fields/LocationFields/SublocalityLevelTwoField/SublocalityLevelTwoField'
import { routeField } from '@/RealizeCore/admin/Fields/LocationFields/RouteField/RouteField'
import { createEnsureGeoHook } from './hooks/createEnsureGeoHook'
import { createDeleteListingMediaAfterDelete } from './hooks/createDeleteListingMediaAfterDelete'
import {
  createQueueSearchIndexAfterChangeHook,
  createQueueSearchIndexAfterDeleteHook,
} from '@/RealizeCore/services/search/jobs/hooks/queueSearchIndexJob'
import { LISTING_SEARCH_TASK } from '@/RealizeCore/services/search/jobs/tasks/searchIndexTasks'

export const ListingsCollection: CollectionConfig = {
  slug: 'listings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title'],
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
              required: true,
              localized: true,
            },
            slugField,
            urlAliasField({ sourceFieldPath: 'title' }),
          ],
        },
        {
          label: 'Locations',
          fields: [
            administrativeAreaRelationshipField,
            CityRelationshipField,
            sublocalityLevelOneField,
            sublocalityLevelTwoField,
            routeField,
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
                      targetCollection: 'listings',
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
    // beforeValidate: [createEnsureGeoHook()],
    afterChange: [
      createSyncAttributeSelectionsAfterChange({ collectionSlug: 'listings' }),
      createQueueSearchIndexAfterChangeHook(LISTING_SEARCH_TASK),
    ],
    afterDelete: [
      createCleanupAttributeRelationsAfterDelete({ collectionSlug: 'listings' }),
      createDeleteListingMediaAfterDelete(),
      createQueueSearchIndexAfterDeleteHook(LISTING_SEARCH_TASK),
    ],
  },
}

export default ListingsCollection
