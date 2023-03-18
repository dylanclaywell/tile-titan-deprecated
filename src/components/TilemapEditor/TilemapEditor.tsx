import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../../contexts/EditorContext'
import { TileCursor } from './TileCursor'
import { ObjectCursor } from './ObjectCursor'
import { clamp } from '../../utils/clamp'
import { Tile } from './Tile'
import { LayerType } from '../../types/layer'
import { GridOverlay } from './GridOverlay'

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
    tileData: string
  }) => void
}

export function TilemapEditor({ layers, onTileClick }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [
    {
      files,
      selectedFileId,
      selectedLayerId,
      tool,
      showGrid,
      cursorRef,
      zoomLevel,
    },
    { setZoomLevel },
  ] = useContext(EditorContext)
  const [mouseState, setMouseState] = useState({
    leftMouseButtonIsDown: false,
    middleMouseButtonIsDown: false,
  })
  const mouseStateRef = useRef(mouseState)

  function setMouseStateRef(state: Partial<typeof mouseState>) {
    mouseStateRef.current = { ...mouseStateRef.current, ...state }
    setMouseState((currentState) => ({ ...currentState, ...state }))
  }

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayerId = useMemo(() => selectedLayerId, [selectedLayerId])
  const currentLayer = useMemo(
    () => currentFile?.layers.find((layer) => layer.id === currentLayerId),
    [currentFile, currentLayerId]
  )

  const { width, height, tileWidth, tileHeight } = currentFile || {
    width: 0,
    height: 0,
    tileWidth: 0,
    tileHeight: 0,
  }

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

          if (!img || !currentLayerId) return

          const cursorX = Math.ceil((cursorRef.current?.offsetLeft ?? 0) / 32)
          const cursorY = Math.ceil((cursorRef.current?.offsetTop ?? 0) / 32)

          if (
            cursorX < 0 ||
            cursorX > width - 1 ||
            cursorY < 0 ||
            cursorY > height - 1
          )
            return

          if (tool.type === 'tile') {
            img.src = tool.canvas.toDataURL()

            onTileClick({
              layerId: currentLayerId,
              tileX: cursorX,
              tileY: cursorY,
              tilesetX: tool.tilesetX ?? -1,
              tilesetY: tool.tilesetY ?? -1,
              tilesetName: tool.tilesetName ?? 'unknown',
              tileData: img.src,
            })
          } else if (tool.type === 'eraser') {
            onTileClick({
              layerId: currentLayerId,
              tileX: cursorX,
              tileY: cursorY,
              tilesetX: -1,
              tilesetY: -1,
              tilesetName: '',
              tileData: '',
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
    [tool, zoomLevel, currentLayerId, width, height]
  )

  return (
    <div
      id="tilemap-editor"
      className="items-center flex justify-center bg-gray-200 relative h-[calc(100%-3.5rem-1px)]"
    >
      <div
        className={clsx(
          'absolute border-l border-b border-black border-opacity-25',
          {
            'border-r border-t': !showGrid,
          }
        )}
        ref={gridRef}
        style={{
          zoom: zoomLevel,
          width: width * 32,
          height: height * 32,
        }}
      >
        {currentLayer && (
          <>
            <TileCursor anchor={gridRef} layer={currentLayer} />
            <ObjectCursor anchor={gridRef} layer={currentLayer} />
          </>
        )}
        <GridOverlay
          tileHeight={tileHeight}
          tileWidth={tileWidth}
          width={width}
          height={height}
          show={showGrid}
        />
        {layers
          .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
          .map((layer, i) =>
            layer.type === 'tilelayer' ? (
              <div
                key={`layer-${layer.id}`}
                id="tilemap-grid"
                className={clsx('grid absolute', {
                  'pointer-events-none': currentLayer?.id !== layer.id,
                  hidden: !layer.isVisible,
                })}
                style={{
                  gridTemplateColumns: `repeat(${width}, ${tileWidth}px)`,
                  gridTemplateRows: `repeat(${height}, ${tileHeight}px)`,
                  zIndex: i,
                }}
              >
                {layer.data.map((row, y) => {
                  return row.map((tile, x) => {
                    return (
                      <Tile
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        tileWidth={tileWidth}
                        tileHeight={tileHeight}
                        showGrid={showGrid}
                      />
                    )
                  })
                })}
              </div>
            ) : (
              layer.data.map((object, j) => (
                <div
                  key={`object-${layer.id}-${j}`}
                  className="absolute border border-black pointer-events-none"
                  style={{
                    top: object.y2 > object.y ? object.y : object.y2,
                    left: object.x2 > object.x ? object.x : object.x2,
                    width: object.width,
                    height: object.height,
                  }}
                ></div>
              ))
            )
          )}
      </div>
    </div>
  )
}
