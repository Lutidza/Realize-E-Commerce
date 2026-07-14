/**
 * @file src/RealizeCore/fallbacks/types.ts
 * @version 1.0.0 – 2025-02-18 12:20
 * @description Общие типы для системы fallback-состояний.
 */

import type { ReactNode } from 'react'

export type FallbackDescriptor =
  | string
  | {
      collection: string
      entity?: string
      variant?: string
    }

export type FallbackContext = {
  locale?: string
  slug?: string
  path?: string
}

export type TextValue = string | ((context: FallbackContext) => string)
export type NodeValue = ReactNode | ((context: FallbackContext) => ReactNode)

export type FallbackDefinition = {
  heading?: TextValue
  description?: TextValue
  body?: NodeValue
  metadata?: {
    title?: TextValue
    description?: TextValue
  }
}

export type ResolvedFallback = {
  heading: string
  description?: string
  body?: ReactNode
  metadata: {
    title: string
    description?: string
  }
}
