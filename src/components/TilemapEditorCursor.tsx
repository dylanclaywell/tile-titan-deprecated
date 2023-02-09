import React, { useEffect, useContext } from 'react'

import { ToolContext } from '../contexts/ToolContext'
import { TilemapType } from '../types/tilemap'

export interface Props {
  tilemap: TilemapType
  anchor: HTMLElement | null
}

export function TilemapEditorCursor({ tilemap, anchor }: Props) {
  const [toolState] = useContext(ToolContext)
  const [cursorRef, setCursorRef] = React.useState<HTMLDivElement | null>(null)

  useEffect(
    function registerTileTool() {
      function onMouseMove(e: MouseEvent) {
        if (toolState.tool.type !== 'tile') return

        const { clientX, clientY } = e

        if (e.target instanceof HTMLDivElement) {
          const isHoveringTilemapEditor =
            e.target.id === 'tilemap-editor' ||
            e.target.parentElement?.id === 'tilemap-grid'

          if (!cursorRef || !anchor) return

          const offsetY = anchor.offsetTop
          const offsetY2 = anchor.parentElement?.offsetTop ?? 0
          const offsetX = anchor.offsetLeft

          const top = 32 * Math.floor((clientY - offsetY - offsetY2) / 32) + 0.5
          const left = 32 * Math.floor((clientX - offsetX) / 32) - 0.5

          if (isHoveringTilemapEditor) {
            cursorRef.classList.remove('hidden')
            cursorRef.style.top = `${top}px`
            cursorRef.style.left = `${left}px`
          } else {
            cursorRef.classList.add('hidden')
          }
        }
      }

      document.addEventListener('mousemove', onMouseMove)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
      }
    },
    [tilemap, cursorRef]
  )

  const currentTool = toolState.tool

  return (
    <div
      className="p-4 absolute pointer-events-none bg-sky-900 bg-opacity-75 opacity-75"
      ref={(el) => setCursorRef(el)}
      style={{
        width: tilemap.tileWidth,
        height: tilemap.tileHeight,
      }}
    >
      <img
        className="absolute top-0 left-0"
        style={{
          width: tilemap.tileWidth,
          height: tilemap.tileHeight,
        }}
        src={currentTool.canvas.toDataURL()}
      />
    </div>
  )
}
