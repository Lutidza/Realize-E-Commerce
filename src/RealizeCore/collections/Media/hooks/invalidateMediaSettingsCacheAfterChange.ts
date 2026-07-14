/**
 * @file src/RealizeCore/collections/Media/hooks/invalidateMediaSettingsCacheAfterChange.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Global afterChange hook для сброса runtime-кеша настроек медиа.
 */

import type { GlobalAfterChangeHook } from 'payload'

import { invalidateMediaSettingsCache } from '@/RealizeCore/media/services/mediaSettingsService'

export const invalidateMediaSettingsCacheAfterChange: GlobalAfterChangeHook = async ({
  doc,
}) => {
  invalidateMediaSettingsCache()

  return doc
}

export default invalidateMediaSettingsCacheAfterChange
