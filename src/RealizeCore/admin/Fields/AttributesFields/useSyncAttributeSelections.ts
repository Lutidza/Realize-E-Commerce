/**
 * @file src/RealizeCore/admin/Fields/AttributesFields/useSyncAttributeSelections.ts
 * @version 1.0.0 – 2025-02-18 16:10
 * @description Связывает загруженные атрибуты с JSON-состоянием формы Payload.
 */

'use client'

import React from 'react'

import type {
  AttributeSelectionsState,
  AttributeWithValues,
} from '@/RealizeCore/data/attributes/types'
import {
  areSelectionsEqual,
  buildSelectionStateFromAttributes,
  isSelectionsStateEmpty,
} from '@/RealizeCore/data/attributes/state'

export type UseAttributeSelectionsBridgeParams = {
  attributes: AttributeWithValues[]
  selectionState: AttributeSelectionsState
  setValue: (nextState: AttributeSelectionsState) => void
  docId?: number | string
}

/**
 * @param params Параметры синхронизации значений.
 */
export const useSyncAttributeSelections = ({
  attributes,
  selectionState,
  setValue,
  docId,
}: UseAttributeSelectionsBridgeParams) => {
  const serverSelections = React.useMemo(
    () => buildSelectionStateFromAttributes(attributes),
    [attributes],
  )

  const previousDocIdRef = React.useRef<typeof docId>(docId)

  React.useEffect(() => {
    const serverIsEmpty = isSelectionsStateEmpty(serverSelections)
    const currentIsEmpty = isSelectionsStateEmpty(selectionState)
    const docChanged = previousDocIdRef.current !== docId

    previousDocIdRef.current = docId

    if (serverIsEmpty) {
      return
    }

    if (!currentIsEmpty && !docChanged) {
      return
    }

    if (areSelectionsEqual(selectionState, serverSelections)) {
      return
    }

    setValue(serverSelections)
  }, [docId, selectionState, serverSelections, setValue])
}

export default useSyncAttributeSelections
