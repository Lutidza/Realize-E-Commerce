/**
 * @file src/RealizeCore/services/search/elasticsearch/mappings/listingsMapping.ts
 * @version 0.1.0 – 2026-03-01 12:45
 * @description Mapping для индекса listings.
 */

export const listingsMapping = {
  dynamic: 'strict',
  properties: {
    collection: { type: 'keyword' },
    id: { type: 'keyword' },
    slug: { type: 'keyword' },
    urlAlias: { type: 'keyword' },
    title: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword', ignore_above: 256 },
      },
    },
    localeTitle: {
      type: 'object',
      dynamic: true,
    },
    cityId: { type: 'keyword' },
    cityAlias: { type: 'keyword' },
    geoPoint: { type: 'geo_point' },
    facets: {
      type: 'object',
      dynamic: true,
    },
    attributeSelections: {
      type: 'object',
      dynamic: true,
    },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
}

export default listingsMapping
