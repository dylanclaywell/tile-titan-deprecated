import React, { MutableRefObject, useContext, useEffect, useMemo } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../contexts/EditorContext'

export interface Props {
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

function isHoveringTilemapEditor(event: MouseEvent) {
  if (!(event.target instanceof HTMLDivElement)) return false

  return (
    event.target.id === 'tilemap-editor' ||
    event.target.parentElement?.id === 'tilemap-grid' ||
    event.target.parentElement?.id === 'tilemap-editor'
  )
}

export function StructureCursor({ anchor }: Props) {
  const [
    { structureRef, zoomLevel, selectedFileId, files, tool },
    { setStructureRef, dispatch },
  ] = useContext(EditorContext)

  const currentFile = useMemo(
    () => files.find((file) => file.id === selectedFileId),
    [selectedFileId]
  )

  const { tileWidth, tileHeight } = currentFile ?? {
    tileWidth: 0,
    tileHeight: 0,
  }

  return (
    <div
      ref={(el) => setStructureRef(el)}
      className={clsx(
        'absolute hidden pointer-events-none w-full h-full opacity-75'
      )}
    >
      <img alt="structure" />
    </div>
  )
}
