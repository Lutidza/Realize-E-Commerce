/**
 * @file src/RealizeCore/admin/Fields/LocationFields/components/AdministrativeAreaRelationshipFieldComponent.tsx
 * @version 1.0.0 – 2025-02-25 17:10
 * @description Обёртка RelationshipField для муниципалитета: сбрасывает город/route на лету.
 */

'use client'

import React from 'react'
import { RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'

import { deriveSiblingPath } from '../../utils/deriveSiblingPath'

export const AdministrativeAreaRelationshipFieldComponent: RelationshipFieldClientComponent = (props) => {
  const { value, setValue } = useField({
    path: props.path,
  })

  const cityPath = React.useMemo(() => deriveSiblingPath(props.path, 'city'), [props.path])
  const routePath = React.useMemo(() => deriveSiblingPath(props.path, 'route'), [props.path])

  const { setValue: setCity } = useField({
    path: cityPath,
  })
  const { setValue: setRoute } = useField({
    path: routePath,
  })

  React.useEffect(() => {
    if (value === undefined) {
      setValue(null)
    }
  }, [setValue, value])

  React.useEffect(() => {
    setCity(null)
    setRoute(null)
  }, [value, setCity, setRoute])

  return <RelationshipField {...props} />
}

export default AdministrativeAreaRelationshipFieldComponent
