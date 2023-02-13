import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../../contexts/EditorContext'
import { TilemapEditorCursor } from './Cursor'
import { clamp } from '../../utils/clamp'
import { Tile } from './Tile'
import { LayerType } from '../../types/layer'

export interface Props {
  layers: LayerType[]
  currentLayer: LayerType | undefined
  onTileClick: (args: {
    layerId: string
    tileX: number
    tileY: number
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
}

export function TilemapEditor({ layers, currentLayer, onTileClick }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [{ tool, showGrid, cursorRef, zoomLevel }, { setZoomLevel }] =
    useContext(EditorContext)
  const [mouseState, setMouseState] = useState({
    leftMouseButtonIsDown: false,
    middleMouseButtonIsDown: false,
  })
  const mouseStateRef = useRef(mouseState)

  function setMouseStateRef(state: Partial<typeof mouseState>) {
    mouseStateRef.current = { ...mouseStateRef.current, ...state }
    setMouseState((currentState) => ({ ...currentState, ...state }))
  }

  const { width, height, id } = currentLayer || {}

  const currentLayerData = useMemo(
    () =>
      width && height && id
        ? {
            width,
            height,
            id,
          }
        : undefined,
    [width, height, id]
  )

  useEffect(
    function registerEventListeners() {
      let prevX = 0
      let prevY = 0

      function handleMouseDown(e: MouseEvent) {
        if (e.button === 0) {
          setMouseStateRef({
            leftMouseButtonIsDown: true,
          })
        } else if (e.button === 1) {
          prevX = e.x
          prevY = e.y
          setMouseStateRef({
            middleMouseButtonIsDown: true,
          })
        }
      }

      function handleMouseUp(e: MouseEvent) {
        if (e.button === 0) {
          setMouseStateRef({
            leftMouseButtonIsDown: false,
          })
        } else if (e.button === 1) {
          setMouseStateRef({
            middleMouseButtonIsDown: false,
          })
        }
      }

      function handleMouseMove(e: MouseEvent) {
        const { leftMouseButtonIsDown, middleMouseButtonIsDown } =
          mouseStateRef.current

        if (
          leftMouseButtonIsDown &&
          e.target instanceof HTMLDivElement &&
          e.target.dataset.type === 'tile'
        ) {
          handleLeftMouseButtonClick(e)
        }

        if (middleMouseButtonIsDown) {
          if (gridRef.current) {
            const top = Number(
              gridRef.current.style.top?.split('px')?.[0] ||
                gridRef.current.offsetTop
            )
            const left = Number(
              gridRef.current.style.left?.split('px')?.[0] ||
                gridRef.current.offsetLeft
            )

            const deltaX = -clamp(prevX - e.x, -10, 10)
            const deltaY = -clamp(prevY - e.y, -10, 10)

            gridRef.current.style.left = `${left + deltaX}px`
            gridRef.current.style.top = `${top + deltaY}px`

            prevX = e.x
            prevY = e.y
          }
        }
      }

      function handleLeftMouseButtonClick(e: MouseEvent) {
        if (
          e.target instanceof HTMLDivElement &&
          e.target.dataset.type === 'tile'
        ) {
          const img = e.target.querySelector('img')

          if (!img || !currentLayerData) return

          const cursorX = Math.ceil((cursorRef.current?.offsetLeft ?? 0) / 32)
          const cursorY = Math.ceil((cursorRef.current?.offsetTop ?? 0) / 32)

          if (
            cursorX < 0 ||
            cursorX > currentLayerData.width - 1 ||
            cursorY < 0 ||
            cursorY > currentLayerData.height - 1
          )
            return

          if (tool.type === 'tile') {
            onTileClick({
              layerId: currentLayerData.id,
              tileX: cursorX,
              tileY: cursorY,
              tilesetX: tool.tilesetX ?? -1,
              tilesetY: tool.tilesetY ?? -1,
              tilesetName: tool.tilesetName ?? 'unknown',
            })

            img.src = tool.canvas.toDataURL()
          } else if (tool.type === 'eraser') {
            onTileClick({
              layerId: currentLayerData.id,
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

      document.addEventListener('click', handleLeftMouseButtonClick)
      document.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('wheel', handleMouseWheel)

      return () => {
        document.removeEventListener('click', handleLeftMouseButtonClick)
        document.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('wheel', handleMouseWheel)
      }
    },
    [tool, zoomLevel, currentLayerData]
  )

  return (
    <div
      id="tilemap-editor"
      className="items-center flex justify-center bg-gray-200 relative h-[calc(100%-3.5rem-1px)]"
    >
      <div
        className="absolute"
        ref={gridRef}
        style={{
          zoom: zoomLevel,
        }}
      >
        {currentLayer && (
          <TilemapEditorCursor anchor={gridRef} layer={currentLayer} />
        )}
        {layers.map((layer, i) => (
          <div
            key={`layer-${layer.id}`}
            id="tilemap-grid"
            className={clsx(
              'grid border-l border-b border-black border-opacity-25 absolute',
              {
                'border-r border-t': !showGrid,
                'pointer-events-none': currentLayer?.id !== layer.id,
              }
            )}
            style={{
              gridTemplateColumns: `repeat(${layer.width}, ${layer.tileWidth}px)`,
              gridTemplateRows: `repeat(${layer.height}, ${layer.tileHeight}px)`,
              zIndex: i,
            }}
          >
            {layer.tilemap.map((row, y) => {
              return row.map((tile, x) => {
                return (
                  <Tile
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    classes={clsx({
                      hidden: !layer.isVisible,
                    })}
                    tileWidth={layer.tileWidth}
                    tileHeight={layer.tileHeight}
                    showGrid={showGrid}
                  />
                )
              })
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
