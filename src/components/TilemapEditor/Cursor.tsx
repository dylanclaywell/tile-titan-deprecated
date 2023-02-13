import React, { useEffect, useContext, MutableRefObject } from 'react'

import { EditorContext } from '../../contexts/EditorContext'
import { LayerType } from '../../types/layer'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function TilemapEditorCursor({ layer, anchor }: Props) {
  const [{ cursorRef, tool, zoomLevel }, { setCursorRef }] =
    useContext(EditorContext)

  useEffect(
    function registerTileTool() {
      function onMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        if (e.target instanceof HTMLDivElement) {
          const isHoveringTilemapEditor =
            e.target.id === 'tilemap-editor' ||
            e.target.parentElement?.id === 'tilemap-grid'

          if (!cursorRef.current || !anchor) return

          const { x: offsetX, y: offsetY } =
            'current' in anchor
              ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
              : anchor.getBoundingClientRect()

          const tileSize = 32

          const top =
            tileSize * Math.floor((clientY / zoomLevel - offsetY) / tileSize)
          const left =
            tileSize * Math.floor((clientX / zoomLevel - offsetX) / tileSize)

          if (isHoveringTilemapEditor) {
            cursorRef.current.classList.remove('hidden')
            cursorRef.current.style.top = `${top}px`
            cursorRef.current.style.left = `${left}px`
          } else {
            cursorRef.current.classList.add('hidden')
          }
        }
      }

      document.addEventListener('mousemove', onMouseMove)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
      }
    },
    [zoomLevel]
  )

  return (
    <div
      className="p-4 absolute pointer-events-none bg-blue-600 bg-opacity-75 opacity-75 z-50"
      ref={(el) => setCursorRef(el)}
      style={{
        width: layer.tileWidth,
        height: layer.tileHeight,
      }}
    >
      <img
        className="absolute top-0 left-0"
        style={{
          width: layer.tileWidth,
          height: layer.tileHeight,
        }}
        src={tool.canvas.toDataURL()}
      />
    </div>
  )
}
