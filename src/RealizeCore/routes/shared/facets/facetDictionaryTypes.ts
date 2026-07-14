/**
 * @file src/RealizeCore/routes/shared/facets/facetDictionaryTypes.ts
 * @version 0.1.0 – 2026-03-02 17:05
 * @description Общие DTO для словарей фасетов.
 */

export type FacetAliasEntry = {
  key: string
  value: string
  valueId: number
  valueLabel: string
  attributeId: number
  attributeLabel: string
  urlOrder: number
  alias: string
  showInFilter: boolean
}

export type FacetDictionary = {
  byAlias: Record<string, FacetAliasEntry>
  byValueId: Record<number, FacetAliasEntry>
}
