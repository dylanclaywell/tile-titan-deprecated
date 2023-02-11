import React, { useContext, useEffect } from 'react'
import clsx from 'clsx'

import { TilemapType } from '../types/tilemap'
import { EditorContext } from '../contexts/ToolContext'
import { TilemapEditorCursor } from './TilemapEditorCursor'

export interface Props {
  tilemap: TilemapType
  onTileClick: (args: {
    tileX: number
    tileY: number
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
}

export function TilemapEditor({ tilemap, onTileClick }: Props) {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null)
  const [{ tool, showGrid, cursorRef, zoomLevel }, { setZoomLevel }] =
    useContext(EditorContext)
  const [mouseIsDown, setMouseIsDown] = React.useState(false)

  useEffect(
    function registerEventListeners() {
      function handleMouseDown() {
        setMouseIsDown(true)
      }

      function handleMouseUp() {
        setMouseIsDown(false)
      }

      function handleMouseMove(e: MouseEvent) {
        if (
          mouseIsDown &&
          e.target instanceof HTMLDivElement &&
          e.target.dataset.type === 'tile'
        ) {
          handleMouseClick(e)
        }
      }

      function handleMouseClick(e: MouseEvent) {
        if (
          e.target instanceof HTMLDivElement &&
          e.target.dataset.type === 'tile'
        ) {
          const img = e.target.querySelector('img')

          if (!img) return

          const cursorX = Math.floor((cursorRef?.offsetLeft ?? 0) / 32)
          const cursorY = Math.floor((cursorRef?.offsetTop ?? 0) / 32)

          if (
            cursorX < 0 ||
            cursorX > tilemap.width ||
            cursorY < 0 ||
            cursorY > tilemap.height
          )
            return

          if (tool.type === 'tile') {
            onTileClick({
              tileX: cursorX,
              tileY: cursorY,
              tilesetX: tool.tilesetX ?? -1,
              tilesetY: tool.tilesetY ?? -1,
              tilesetName: tool.tilesetName ?? 'unknown',
            })

            img.src = tool.canvas.toDataURL()
          } else if (tool.type === 'eraser') {
            onTileClick({
              tileX: cursorX,
              tileY: cursorY,
              tilesetX: -1,
              tilesetY: -1,
              tilesetName: '',
            })

            img.src = ''
          }
        }
      }

      function handleMouseWheel(e: WheelEvent) {
        if (
          e.target instanceof HTMLDivElement &&
          (e.target?.id === 'tilemap-editor' ||
            e.target?.id === 'tilemap-grid' ||
            e.target.dataset?.['type'] === 'tile')
        ) {
          const delta = e.deltaY

          if (delta > 0) {
            setZoomLevel(zoomLevel - 0.1 * zoomLevel)
          } else if (delta < 0) {
            setZoomLevel(zoomLevel + 0.1 * zoomLevel)
          }
        }
      }

      document.addEventListener('click', handleMouseClick)
      document.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('wheel', handleMouseWheel)

      return () => {
        document.removeEventListener('click', handleMouseClick)
        document.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('wheel', handleMouseWheel)
      }
    },
    [mouseIsDown, tool, cursorRef, onTileClick, zoomLevel]
  )

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
            'border-r border-t': !showGrid,
          }
        )}
        style={{
          gridTemplateColumns: `repeat(${tilemap.width}, ${tilemap.tileWidth}px)`,
          gridTemplateRows: `repeat(${tilemap.height}, ${tilemap.tileHeight}px)`,
          zoom: zoomLevel,
        }}
      >
        <TilemapEditorCursor anchor={ref} tilemap={tilemap} />
        {tilemap.data.map((row, y) => {
          return row.map((tile, x) => {
            return (
              <div
                key={`tile-${x}`}
                data-type="tile"
                data-x={x}
                data-y={y}
                className={clsx({
                  'border-t border-r border-black border-opacity-10 select-none':
                    showGrid,
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
