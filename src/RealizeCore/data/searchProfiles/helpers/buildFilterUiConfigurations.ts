/**
 * @file src/RealizeCore/data/searchProfiles/helpers/buildFilterUiConfigurations.ts
 * @version 1.4.0 – 2026-03-02 22:50
 * @description Расчёт UI-конфигураций фильтров Search Profile.
 */

import type { FacetAttributeRecord } from '@/RealizeCore/data/attributes/queries/getFacetAttributes'
import type { SearchProfile } from '@/payload-types'
import type { ResolvedFilterUiSetting } from '../types'

/**
 * Собирает UI-конфигурации фильтров на основе исходных настроек Search Profile.
 */
export const buildFilterUiConfigurations = (
  settings: SearchProfile['filterUiSettings'],
  facetMap: Map<number, FacetAttributeRecord>,
): ResolvedFilterUiSetting[] => {
  if (!settings) {
    return []
  }

  const filterUiSettings: ResolvedFilterUiSetting[] = []

  settings.forEach((setting) => {
    const attributeId = typeof setting?.attribute === 'number' ? setting.attribute : null
    if (attributeId === null) {
      return
    }

    const attribute = facetMap.get(attributeId)
    if (!attribute) {
      return
    }

    filterUiSettings.push({
      attributeId,
      key: attribute.slug,
      panel: setting.panel ?? 'primary',
      component: setting.component ?? 'checkbox-list',
      pinned: setting.uiPinned === true,
      collapsedByDefault: setting.collapsedByDefault === true,
      label: setting.customLabel && setting.customLabel.length > 0 ? setting.customLabel : attribute.name,
    })
  })

  return filterUiSettings
}

export default buildFilterUiConfigurations
