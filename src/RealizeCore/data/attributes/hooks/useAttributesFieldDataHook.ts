/**
 * @file src/RealizeCore/data/attributes/useAttributesFieldDataHook.ts
 * @version 1.1.0 – 2025-02-18 12:55
 * @description Загрузка атрибутов для UI без привязки к форме.
 */

'use client'

import React from 'react'

import type { AttributeWithValues } from '@/RealizeCore/data/attributes/types'

import { fetchAttributesAction } from '@/RealizeCore/data/attributes/actions'

export const useAttributesFieldDataHook = (
  collectionSlug: string,
  docId?: number | string,
) => {
  const [attributes, setAttributes] = React.useState<AttributeWithValues[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAttributesAction({ collectionSlug, entityId: docId })
      .then((response: AttributeWithValues[]) => {
        setAttributes(response)
      })
      .catch(() => setError('Не удалось загрузить атрибуты'))
      .finally(() => setLoading(false))
  }, [collectionSlug, docId])

  return { attributes, loading, error }
}

export default useAttributesFieldDataHook
