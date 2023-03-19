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

  useEffect(
    function registerEventListeners() {
      function handleMouseMove(event: MouseEvent) {
        const { clientX, clientY } = event

        if (!(event.target instanceof HTMLDivElement)) return

        if (!structureRef.current || !anchor) return

        const { x: offsetX, y: offsetY } =
          'current' in anchor
            ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
            : anchor.getBoundingClientRect()

        const top =
          tileHeight * Math.floor((clientY - offsetY) / zoomLevel / tileHeight)
        const left =
          tileWidth * Math.floor((clientX - offsetX) / zoomLevel / tileWidth)

        if (isHoveringTilemapEditor(event)) {
          structureRef.current.classList.remove('hidden')
          structureRef.current.style.top = `${top}px`
          structureRef.current.style.left = `${left}px`
        } else {
          structureRef.current.classList.add('hidden')
        }
      }

      window.addEventListener('mousemove', handleMouseMove)

      return function unregisterEventListeners() {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [currentFile, zoomLevel]
  )

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
