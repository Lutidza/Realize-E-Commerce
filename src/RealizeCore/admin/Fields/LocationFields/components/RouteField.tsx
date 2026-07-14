/**
 * @file src/RealizeCore/admin/Fields/LocationFields/components/RouteField.tsx
 * @description Клиентский компонент relationship-поля Route: динамически фильтрует опции по выбранному городу.
 */

'use client'

import React from 'react'
import { RelationshipField, useField } from '@payloadcms/ui'
import type { FilterOptions, RelationshipFieldClient, RelationshipFieldClientComponent } from 'payload'

import { deriveSiblingPath } from '../utils/deriveSiblingPath'
import { extractRelationId } from '../utils/extractRelationId'

type RelationshipFieldClientWithFilter = RelationshipFieldClient & {
  filterOptions?: FilterOptions
}

export const RouteField: RelationshipFieldClientComponent = (props) => {
  const { value, setValue } = useField({
    path: props.path,
  })
  const cityPath = React.useMemo(() => deriveSiblingPath(props.path, 'city'), [props.path])
  const { value: cityValue } = useField({
    path: cityPath,
  })

  const cityId = React.useMemo(() => extractRelationId(cityValue), [cityValue])

  const fieldWithFilter = React.useMemo<RelationshipFieldClientWithFilter>(() => {
    const baseField = (props.field ?? {}) as RelationshipFieldClientWithFilter

    if (typeof cityId === 'number') {
      return {
        ...baseField,
        filterOptions: {
          parentArea: { equals: cityId },
        },
      }
    }

    const { filterOptions: _ignoredFilter, ...rest } = baseField
    return rest
  }, [props.field, cityId])

  React.useEffect(() => {
    if (value === undefined) {
      setValue(null)
    }
  }, [setValue, value])

  return <RelationshipField {...props} field={fieldWithFilter as RelationshipFieldClient} />
}

export default RouteField
