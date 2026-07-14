/**
 * @file src/RealizeCore/admin/Fields/LocationFields/components/CityRelationshipField.tsx
 * @description RelationshipField для города: гарантирует отправку null при очистке.
 */

'use client'

import React from 'react'
import { RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'

export const CityField: RelationshipFieldClientComponent = (props) => {
  const { value, setValue } = useField({
    path: props.path,
  })

  React.useEffect(() => {
    if (value === undefined) {
      setValue(null)
    }
  }, [setValue, value])

  return <RelationshipField {...props} />
}

export default CityField
