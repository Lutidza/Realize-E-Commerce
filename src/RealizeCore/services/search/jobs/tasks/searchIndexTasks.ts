/**
 * @file src/RealizeCore/services/search/jobs/tasks/searchIndexTasks.ts
 * @version 0.1.0 – 2026-03-01 13:40
 * @description Tasks для синхронизации документов с Elasticsearch.
 */

import payloadConfig from '@payload-config'
import { errors } from '@elastic/elasticsearch'
import { getPayload, type PayloadRequest, type TaskConfig } from 'payload'

import type { Company, Listing } from '@/payload-types'
import { getResolvedProfileForCollection } from '@/RealizeCore/data/searchProfiles/getResolvedProfileForCollection'
import buildListingDocument from '@/RealizeCore/services/search/elasticsearch/indexers/listingsIndexer'
import buildCompanyDocument from '@/RealizeCore/services/search/elasticsearch/indexers/companiesIndexer'
import { getElasticsearchClient } from '@/RealizeCore/services/search/elasticsearch/client'
import type { ResolvedSearchProfile } from '@/RealizeCore/data/searchProfiles/types'
import { DELETE_OPERATION, INDEX_OPERATION, type SearchIndexTaskSlug } from '../constants'

const OPERATION_OPTIONS = [
  { label: 'Index', value: INDEX_OPERATION },
  { label: 'Delete', value: DELETE_OPERATION },
]

type Operation = typeof INDEX_OPERATION | typeof DELETE_OPERATION
type SearchIndexTaskInputOutput = {
  input: {
    documentId: number
    operation: Operation
  }
  output: {
    deleted?: boolean
    indexed?: boolean
  }
}

const ensurePayload = async (req?: PayloadRequest) =>
  req?.payload ?? (await getPayload({ config: await payloadConfig }))

const resolveIndexAlias = (profile: ResolvedSearchProfile | null, collection: string) =>
  profile?.indexAlias && profile.indexAlias.length > 0
    ? profile.indexAlias
    : `${collection}_current`

const handleDelete = async ({
  indexAlias,
  documentId,
}: {
  indexAlias: string
  documentId: number
}) => {
  const esClient = getElasticsearchClient()

  try {
    await esClient.delete({
      index: indexAlias,
      id: String(documentId),
    })
  } catch (error) {
    if (!(error instanceof errors.ResponseError && error.statusCode === 404)) {
      throw error
    }
  }

  return {
    output: {
      deleted: true,
    },
  }
}

const createSyncTask = <TDoc,>({
  slug,
  collection,
  buildDocument,
}: {
  slug: SearchIndexTaskSlug
  collection: 'listings' | 'companies'
  buildDocument: (args: { doc: TDoc; profile: ResolvedSearchProfile | null }) => Record<string, unknown>
}): TaskConfig<SearchIndexTaskInputOutput> => ({
  slug,
  label: `Sync ${collection} document to Elasticsearch`,
  retries: 3,
  inputSchema: [
    {
      name: 'documentId',
      label: 'Document ID',
      type: 'number',
      required: true,
    },
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      defaultValue: 'index',
      options: OPERATION_OPTIONS,
    },
  ],
  handler: async ({ input, req }) => {
    const documentId = Number(input.documentId)
    const operation = input.operation as Operation

    if (!Number.isFinite(documentId)) {
      throw new Error('Invalid documentId provided for search indexing task')
    }

    const payload = await ensurePayload(req)
    const profile = await getResolvedProfileForCollection(payload, collection)
    const indexAlias = resolveIndexAlias(profile, collection)

    if (operation === 'delete') {
      return handleDelete({
        indexAlias,
        documentId,
      })
    }

    const doc = (await payload.findByID({
      collection,
      id: documentId,
      depth: 2,
    })) as TDoc | null

    if (!doc) {
      return handleDelete({
        indexAlias,
        documentId,
      })
    }

    const document = buildDocument({
      doc,
      profile,
    })

    const esClient = getElasticsearchClient()

    await esClient.index({
      index: indexAlias,
      id: String(documentId),
      document,
      refresh: false,
    })

    return {
      output: {
        indexed: true,
      },
    }
  },
})

export const LISTING_SEARCH_TASK = 'syncListingSearchDocument' satisfies SearchIndexTaskSlug
export const COMPANY_SEARCH_TASK = 'syncCompanySearchDocument' satisfies SearchIndexTaskSlug

export const searchIndexTasks: Array<TaskConfig<SearchIndexTaskInputOutput>> = [
  createSyncTask<Listing>({
    slug: LISTING_SEARCH_TASK,
    collection: 'listings',
    buildDocument: ({ doc, profile }) =>
      buildListingDocument({
        listing: doc,
        profile,
      }),
  }),
  createSyncTask<Company>({
    slug: COMPANY_SEARCH_TASK,
    collection: 'companies',
    buildDocument: ({ doc, profile }) =>
      buildCompanyDocument({
        company: doc,
        profile,
      }),
  }),
]

export default searchIndexTasks
