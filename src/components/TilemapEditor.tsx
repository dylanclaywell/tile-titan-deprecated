import React, { useContext, useEffect } from 'react'
import clsx from 'clsx'

import { TilemapType } from '../types/tilemap'
import { ToolContext } from '../contexts/ToolContext'
import { TilemapEditorCursor } from './TilemapEditorCursor'

export interface Props {
  tilemap: TilemapType
}

export function TilemapEditor({ tilemap }: Props) {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null)
  const [toolState] = useContext(ToolContext)

  useEffect(function registerEventListeners() {
    let mouseIsDown = false

    function handleMouseDown() {
      mouseIsDown = true
    }

    function handleMouseUp() {
      mouseIsDown = false
    }

    function handleMouseMove(e: MouseEvent) {
      if (
        mouseIsDown &&
        e.target instanceof HTMLDivElement &&
        e.target.dataset.type === 'tile'
      ) {
        e.target.click()
      }
    }

    function handleMouseClick(e: MouseEvent) {
      if (
        e.target instanceof HTMLDivElement &&
        e.target.dataset.type === 'tile'
      ) {
        if (toolState.tool.type === 'tile') {
          const img = e.target.querySelector('img')

          if (!img) return

          img.src = toolState.tool.canvas.toDataURL()
        } else if (toolState.tool.type === 'eraser') {
          const img = e.target.querySelector('img')

          if (!img) return

          img.src = ''
        }
      }
    }

    document.addEventListener('click', handleMouseClick)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('click', handleMouseClick)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  })

  return (
    <div
      id="tilemap-editor"
      className="items-center flex justify-center bg-gray-300 relative h-[calc(100%-3.5rem-1px)]"
    >
      <div
        ref={(el) => setRef(el)}
        id="tilemap-grid"
        className={clsx(
          'grid border-l border-b border-black border-opacity-10 relative',
          {
            'border-r border-t': !toolState.showGrid,
          }
        )}
        style={{
          gridTemplateColumns: `repeat(${tilemap.width}, ${tilemap.tileWidth}px)`,
          gridTemplateRows: `repeat(${tilemap.height}, ${tilemap.tileHeight}px)`,
        }}
      >
        <TilemapEditorCursor anchor={ref} tilemap={tilemap} />
        {tilemap.data.map((row) => {
          return row.map((tile, i) => {
            return (
              <div
                key={`tile-${i}`}
                data-type="tile"
                className={clsx({
                  'border-t border-r border-black border-opacity-10 select-none':
                    toolState.showGrid,
                })}
                style={{
                  width: tilemap.tileWidth,
                  height: tilemap.tileHeight,
                }}
              >
                <img className="pointer-events-none outline-none select-none" />
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}
