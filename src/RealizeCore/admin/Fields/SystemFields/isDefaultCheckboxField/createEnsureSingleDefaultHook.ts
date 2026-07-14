/**
 * @file src/RealizeCore/admin/hooks/createEnsureSingleDefaultHook.ts
 * @version 1.0.0 – 2025-12-23 22:45
 * @description
 * Helper for enforcing a single `isDefault` record inside a collection.
 */

import type { CollectionAfterChangeHook } from 'payload'
import type { Config } from '@/payload-types'

/**
 * @remarks
 * Returns afterChange hook which unsets `fieldName` for other documents.
 */
export const createEnsureSingleDefaultHook = (
  options: {
    fieldName?: string
    collectionSlug?: keyof Config['collections']
  } = {},
): CollectionAfterChangeHook => {
  const fieldName = options.fieldName ?? 'isDefault'

  return async ({ doc, req, collection }) => {
    if (!doc?.[fieldName]) {
      return doc
    }

    const targetCollection = options.collectionSlug ?? collection.slug

    const { docs } = await req.payload.find({
      collection: targetCollection,
      where: {
        and: [
          { id: { not_equals: doc.id } },
          { [fieldName]: { equals: true } },
        ],
      },
      depth: 0,
      limit: 100,
      overrideAccess: true,
    })

    if (!docs.length) {
      return doc
    }

    await Promise.all(
      docs.map((item) =>
        req.payload.update({
          collection: targetCollection,
          id: item.id,
          data: { [fieldName]: false },
          overrideAccess: true,
        }),
      ),
    )

    return doc
  }
}

export default createEnsureSingleDefaultHook
