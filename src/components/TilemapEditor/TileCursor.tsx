import React, { useEffect, useContext, MutableRefObject, useMemo } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../../contexts/EditorContext'
import { LayerType } from '../../types/layer'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function TileCursor({ anchor }: Props) {
  const [
    { cursorRef, tool, zoomLevel, tileWidth, tileHeight, selectedLayerId },
    { setCursorRef },
  ] = useContext(EditorContext)

  const width = useMemo(() => tileWidth, [tileWidth])
  const height = useMemo(() => tileHeight, [tileHeight])

  useEffect(
    function registerTileTool() {
      function handleTileToolMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        if (!(e.target instanceof HTMLDivElement)) return

        const isHoveringTilemapEditor =
          e.target.id === 'tilemap-editor' ||
          e.target.parentElement?.id === 'tilemap-grid'

        if (!cursorRef.current || !anchor) return

        const { x: offsetX, y: offsetY } =
          'current' in anchor
            ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
            : anchor.getBoundingClientRect()

        const top =
          height * Math.floor((clientY / zoomLevel - offsetY) / height)
        const left = width * Math.floor((clientX / zoomLevel - offsetX) / width)

        if (isHoveringTilemapEditor) {
          cursorRef.current.classList.remove('hidden')
          cursorRef.current.style.top = `${top}px`
          cursorRef.current.style.left = `${left}px`
        } else {
          cursorRef.current.classList.add('hidden')
        }
      }

      function onMouseMove(e: MouseEvent) {
        if (tool.type !== 'object') {
          handleTileToolMouseMove(e)
        }
      }

      document.addEventListener('mousemove', onMouseMove)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
      }
    },
    [zoomLevel, tool, selectedLayerId]
  )

  return (
    <div
      className={clsx(
        'p-4 absolute pointer-events-none bg-opacity-75 opacity-75 z-50',
        {
          'bg-blue-600': tool.type !== 'object',
          'bg-transparent': tool.type === 'object',
        }
      )}
      ref={(el) => setCursorRef(el)}
      style={{
        width: tileWidth,
        height: tileHeight,
      }}
    >
      <img
        className="absolute top-0 left-0"
        style={{
          width: tileWidth,
          height: tileHeight,
        }}
        src={tool.canvas.toDataURL()}
      />
    </div>
  )
}
