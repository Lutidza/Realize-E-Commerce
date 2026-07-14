/**
 * @file src/RealizeCore/data/searchProfiles/helpers/resolveFacetUrlFormat.ts
 * @version 1.0.0 – 2026-03-02 23:20
 * @description Определение URL-формата фасетов с учётом overrides.
 */

import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import type { ResolvedFacet } from '../types'
import type { FacetOverride } from './buildFacetOverrideMap'

export const resolveFacetUrlFormat = (
  attribute: FacetAttributeRecord,
  override?: FacetOverride,
): ResolvedFacet['urlFormat'] => {
  if (override?.urlFormatOverride) {
    return override.urlFormatOverride
  }

  if (attribute.facetFormat === 'value') {
    return 'value'
  }

  return 'keyValue'
}

export default resolveFacetUrlFormat
