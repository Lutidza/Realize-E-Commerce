/**
 * @file src/RealizeCore/routes/shared/facets/facetDictionary.ts
 * @version 0.1.0 – 2026-03-02 17:05
 * @description Построение и кэширование словарей фасетов для коллекций.
 */

import type { Payload } from 'payload'
import payloadConfig from '@payload-config'
import { getPayload } from 'payload'

import { getFacetAttributes } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import { getResolvedProfileForCollection } from '@/RealizeCore/data/searchProfiles/getResolvedProfileForCollection'
import type {
  ResolvedFacet,
  ResolvedSearchProfile,
} from '@/RealizeCore/data/searchProfiles/types'
import { resolveRelationId } from '@/RealizeCore/utils/relations/resolveRelationId'
import type { FacetAliasEntry, FacetDictionary } from './facetDictionaryTypes'

type AttributeValueRecord = {
  id: number
  attribute: number | { id: number }
  name: string
  slug?: string
  urlAlias?: Record<string, string>
}

type AttributeValueMap = Record<number, AttributeValueRecord[]>

const cache: Record<
  string,
  {
    dict: FacetDictionary
    timestamp: number
  }
> = {}

const CACHE_TTL = 1000 * 60

const normalizeAliasMap = (alias: unknown): Record<string, string> => {
  if (!alias || typeof alias !== 'object') {
    return {}
  }

  return alias as Record<string, string>
}

const collectAliasVariants = (alias: unknown, fallback?: string): string[] => {
  const aliasMap = normalizeAliasMap(alias)
  const variants = Object.values(aliasMap)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  if (fallback && typeof fallback === 'string' && fallback.trim().length > 0) {
    variants.push(fallback.trim())
  }

  return Array.from(new Set(variants))
}

const collectEntries = (
  records: Awaited<ReturnType<typeof getFacetAttributes>>,
  valuesMap: AttributeValueMap,
  facetConfigMap?: Map<number, ResolvedFacet>,
) => {
  const byAlias: Record<string, FacetAliasEntry> = {}
  const byValueId: Record<number, FacetAliasEntry> = {}

  records.forEach((attribute) => {
    const resolvedFacetConfig = facetConfigMap?.get(attribute.id)
    const isFacetInPath = resolvedFacetConfig?.isFacetInPath ?? true

    const resolvedValues = valuesMap[attribute.id] ?? []
    const attributeAliases = collectAliasVariants(attribute.urlAlias, attribute.slug)
    const resolvedAttributeAliases =
      attributeAliases.length > 0 ? attributeAliases : [attribute.slug].filter(Boolean)
    const facetFormatSource =
      resolvedFacetConfig?.urlFormat ??
      (attribute.facetFormat === 'value' ? 'value' : 'keyValue')
    const facetFormat = facetFormatSource === 'value' ? 'value' : 'keyValue'
    const order =
      resolvedFacetConfig?.urlOrder ??
      (typeof attribute.facetPriority === 'number'
        ? attribute.facetPriority
        : Number.MAX_SAFE_INTEGER)

    resolvedValues.forEach((value) => {
      const valueAliases = collectAliasVariants(value.urlAlias, value.slug ?? String(value.id))
      const resolvedValueAliases =
        valueAliases.length > 0 ? valueAliases : [String(value.id)]
      const canonicalValueAlias = resolvedValueAliases[0] ?? String(value.id)
      const canonicalAttributeAlias = String(
        resolvedAttributeAliases[0] ?? attribute.slug ?? attribute.id,
      )
      const canonicalSegment =
        facetFormat === 'value'
          ? canonicalValueAlias
          : `${canonicalAttributeAlias}-${canonicalValueAlias}`

      resolvedValueAliases.forEach((valueAlias) => {
        const segmentAliases =
          facetFormat === 'value'
            ? [valueAlias]
            : resolvedAttributeAliases.map((attributeAlias) => `${attributeAlias}-${valueAlias}`)

        const showInFilter =
          resolvedFacetConfig?.showInFilter ?? attribute.showInFilter === true

        const entry: FacetAliasEntry = {
          key: attribute.slug,
          value: String(value.id),
          valueId: value.id,
          valueLabel: value.name,
          attributeId: attribute.id,
          attributeLabel: attribute.name,
          urlOrder: order,
          alias: canonicalSegment,
          showInFilter,
        }

        byValueId[value.id] = entry

        if (isFacetInPath) {
          segmentAliases.forEach((alias) => {
            if (!alias) {
              return
            }

            byAlias[alias] = entry
          })
        }
      })
    })
  })

  return {
    byAlias,
    byValueId,
  }
}

const logFacetAliases = (dictionary: FacetDictionary) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.debug('[FacetDictionary]', Object.keys(dictionary.byAlias))
}

const loadAttributeValuesForFacets = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  attributeIds: number[],
) => {
  if (attributeIds.length === 0) {
    return []
  }

  const response = await payload.find({
    collection: 'attribute-values',
    depth: 0,
    limit: 0,
    where: {
      attribute: {
        in: attributeIds,
      },
    },
  })

  return response.docs as AttributeValueRecord[]
}

const groupAttributeValues = (records: AttributeValueRecord[]): AttributeValueMap => {
  return records.reduce<AttributeValueMap>((acc, value) => {
    const attributeId = resolveRelationId(value.attribute)

    if (attributeId === null) {
      return acc
    }

    const bucket = acc[attributeId] ?? []
    bucket.push(value)
    acc[attributeId] = bucket
    return acc
  }, {})
}

const buildFacetConfigMap = (facets?: ResolvedFacet[]) => {
  if (!facets) {
    return undefined
  }

  const map = new Map<number, ResolvedFacet>()
  facets.forEach((facet) => {
    map.set(facet.attributeId, facet)
  })
  return map
}

const buildProfileSignature = (profile?: ResolvedSearchProfile | null) => {
  if (!profile || !profile.facets) {
    return 'legacy'
  }

  const parts = profile.facets
    .map(
      (facet) =>
        `${facet.attributeId}:${facet.urlFormat}:${facet.urlOrder}:${facet.isFacetInPath}`,
    )
    .sort()

  return parts.join('|') || 'legacy'
}

const loadFacetDictionary = async (
  payload: Payload,
  collectionSlug: string,
  resolvedProfile?: ResolvedSearchProfile | null,
): Promise<FacetDictionary> => {
  const facetConfigMap = buildFacetConfigMap(resolvedProfile?.facets)
  const records = await getFacetAttributes(payload, collectionSlug)
  const filteredRecords =
    facetConfigMap !== undefined
      ? records.filter((attribute) => facetConfigMap.has(attribute.id))
      : records
  const attributeIds = filteredRecords.map((attribute) => attribute.id)
  const rawValues = await loadAttributeValuesForFacets(payload, attributeIds)
  const valuesMap = groupAttributeValues(rawValues)
  const dictionary = collectEntries(filteredRecords, valuesMap, facetConfigMap)
  logFacetAliases(dictionary)
  return dictionary
}

export const getFacetDictionary = async (collectionSlug: string = 'listings') => {
  const config = await payloadConfig
  const payload = await getPayload({ config })
  const resolvedProfile = await getResolvedProfileForCollection(payload, collectionSlug)
  const signature = `${collectionSlug}:${buildProfileSignature(resolvedProfile ?? null)}`
  const cached = cache[signature]

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.dict
  }

  const dict = await loadFacetDictionary(payload, collectionSlug, resolvedProfile ?? null)
  Object.keys(cache).forEach((key) => {
    if (key.startsWith(`${collectionSlug}:`) && key !== signature) {
      delete cache[key]
    }
  })
  cache[signature] = {
    dict,
    timestamp: Date.now(),
  }

  return dict
}
