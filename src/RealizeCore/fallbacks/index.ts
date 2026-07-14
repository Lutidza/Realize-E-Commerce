/**
 * @file src/RealizeCore/fallbacks/index.ts
 * @version 1.0.0 – 2025-02-18 12:20
 * @description Точка входа для работы с fallback-состояниями.
 */

export { FALLBACK_KEYS, resolveFallback, resolveFallbackMetadata } from './registry'
export type {
  FallbackContext,
  FallbackDefinition,
  FallbackDescriptor,
  NodeValue,
  ResolvedFallback,
  TextValue,
} from './types'
export { default as PageFallback } from './PageFallback'
