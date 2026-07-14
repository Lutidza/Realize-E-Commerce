import type { SearchRequest, SearchResult } from '@/RealizeCore/services/search/SearchProvider'
import { ElasticsearchSearchProvider } from '@/RealizeCore/services/search/elasticsearch/ElasticsearchSearchProvider'

const listingsProvider = new ElasticsearchSearchProvider('listings')

export type ListingSearchItem = {
  id: string | number
  title?: string
  createdAt?: string
  updatedAt?: string
  attributes?: Record<
    string | number,
    | {
        valueIds?: Array<number | string> | null
      }
    | null
    | undefined
  >
}

export type ListingSearchResult = SearchResult

export const searchListings = (params: SearchRequest) => listingsProvider.search(params)
