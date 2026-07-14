/**
 * @file src/RealizeCore/admin/Fields/SeoFields/SearchKeywordsArrayField/SearchKeywordsArrayField.ts
 * @description Переиспользуемое поле-массив для хранения поисковых запросов.
 */

import { Field } from 'payload'


export const SearchKeywordsArrayField: Field =  {
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
}

export default SearchKeywordsArrayField