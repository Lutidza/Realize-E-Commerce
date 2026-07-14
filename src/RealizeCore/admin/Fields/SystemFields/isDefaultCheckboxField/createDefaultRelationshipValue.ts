/**
 * @file src/RealizeCore/admin/Fields/SystemFields/isDefaultCheckboxField/createDefaultRelationshipValue.ts
 * @version 1.0.0 – 2025-12-23 22:25
 * @description
 * Helper returning a defaultValue function for relationship fields,
 * fetching the entry marked with isDefault=true.
 */

import type { CollectionBeforeChangeHook } from 'payload'
import type { Config } from '@/payload-types'

type CollectionName = keyof Config['collections']
type DefaultValueArgs = { req: Parameters<CollectionBeforeChangeHook>[0]['req'] }

export interface CreateDefaultRelationshipValueOptions {
  cacheTtlMs?: number
  warnMessage?: string
}

export const createDefaultRelationshipValue = (
  collection: CollectionName,
  options: CreateDefaultRelationshipValueOptions = {},
) => {
  const cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000
  const warnMessage =
    options.warnMessage ?? `Default entry is missing for collection "${collection}".`

  let cached: { id: string | number; expiresAt: number } | null = null

  return async ({ req }: DefaultValueArgs) => {
    const now = Date.now()
    if (cached && cached.expiresAt > now) {
      return cached.id
    }

    const { docs } = await req.payload.find({
      collection,
      where: { isDefault: { equals: true } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })

    const defaultDoc = docs[0]
    if (!defaultDoc) {
      req.payload.logger.warn(warnMessage)
      cached = null
      return undefined
    }

    cached = { id: defaultDoc.id as string | number, expiresAt: now + cacheTtlMs }
    return cached.id
  }
}

export default createDefaultRelationshipValue
