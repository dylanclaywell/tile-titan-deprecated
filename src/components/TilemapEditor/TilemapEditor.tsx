import React, { useContext, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../../contexts/EditorContext'
import { clamp } from '../../utils/clamp'
import { Tile } from './Tile'
import { LayerType } from '../../types/layer'
import { GridOverlay } from './GridOverlay'
import { convertFileToImageData } from '../../utils/convertFileToImageData'
import { addStructure, addTile, moveCursor, removeTile } from '../../tools'
import { Cursor } from './Cursor'
import { Structure } from '../Structure/Structure'

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
  const [gridPosition, setGridPosition] = useState({
    x: 0,
    y: 0,
  })
  const [previousPosition, setPreviousPosition] = useState({
    x: 0,
    y: 0,
  })
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
    { dispatch },
  ] = useContext(EditorContext)
  const [mouseState, setMouseState] = useState({
    leftMouseButtonIsDown: false,
    middleMouseButtonIsDown: false,
  })

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = useMemo(
    () => currentFile?.layers.find((layer) => layer.id === selectedLayerId),
    [currentFile, selectedLayerId]
  )

  const { width, height, tileWidth, tileHeight } = currentFile || {
    width: 0,
    height: 0,
    tileWidth: 0,
    tileHeight: 0,
  }

  function handleLeftMouseButtonWithDrag(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    const cursor = cursorRef.current
    if (!currentLayer || !cursor) return

    if (tool.type === 'tile') {
      addTile({
        e,
        currentLayerId: currentLayer.id,
        cursor,
        onTileClick,
        tool,
        tileHeight,
        tilemapHeight: height,
        tilemapWidth: width,
        tileWidth,
      })
    } else if (tool.type === 'eraser') {
      if (currentLayer.type === 'tile') {
        removeTile({
          e,
          currentLayerId: currentLayer.id,
          cursor,
          tileWidth,
          tileHeight,
          tool,
          tilemapHeight: height,
          tilemapWidth: width,
          onTileClick,
        })
      }
    }
  }

  return (
    <div
      id="tilemap-editor"
      onClick={() => {
        const cursor = cursorRef.current
        if (!cursor) return

        if (tool.type === 'structure') {
          addStructure({
            cursor,
            dispatch,
          })
        }
      }}
      onWheel={(e) => {
        const delta = e.deltaY

        if (delta > 0) {
          dispatch({
            type: 'SET_ZOOM_LEVEL',
            level: zoomLevel - 0.1 * zoomLevel,
          })
        } else if (delta < 0) {
          dispatch({
            type: 'SET_ZOOM_LEVEL',
            level: zoomLevel + 0.1 * zoomLevel,
          })
        }
      }}
      onMouseMove={(e) => {
        if (mouseState.middleMouseButtonIsDown) {
          const { x, y } = gridPosition

          const deltaX = -clamp(previousPosition.x - e.clientX, -10, 10)
          const deltaY = -clamp(previousPosition.y - e.clientY, -10, 10)

          setGridPosition({
            x: x + deltaX,
            y: y + deltaY,
          })
          setPreviousPosition({
            x: e.clientX ?? 0,
            y: e.clientY ?? 0,
          })
        }

        if (!currentLayer) return

        moveCursor({
          e,
          anchor: gridRef,
          cursor: cursorRef.current,
          tileHeight,
          tileWidth,
          zoomLevel,
        })

        if (mouseState.leftMouseButtonIsDown) {
          handleLeftMouseButtonWithDrag(e)
        }
      }}
      className="items-center flex justify-center bg-gray-200 relative h-[calc(100%-3.5rem-1px)]"
      onMouseDown={(e) => {
        if (e.button === 0) {
          setMouseState((state) => ({
            ...state,
            leftMouseButtonIsDown: true,
          }))

          handleLeftMouseButtonWithDrag(e)
        } else if (e.button === 1) {
          setPreviousPosition({
            x: e.clientX ?? 0,
            y: e.clientY ?? 0,
          })
          setMouseState((state) => ({
            ...state,
            middleMouseButtonIsDown: true,
          }))
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 0) {
          setMouseState((state) => ({
            ...state,
            leftMouseButtonIsDown: false,
          }))
        } else if (e.button === 1) {
          setMouseState((state) => ({
            ...state,
            middleMouseButtonIsDown: false,
          }))
        }
      }}
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
          transform: `scale(${zoomLevel})`,
          width: width * tileWidth,
          height: height * tileHeight,
          top: gridPosition.y,
          left: gridPosition.x,
        }}
      >
        {currentLayer && <Cursor />}
        <GridOverlay
          tileHeight={tileHeight}
          tileWidth={tileWidth}
          width={width}
          height={height}
          show={showGrid}
        />
        {layers
          .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
          .map((layer, i) => {
            switch (layer.type) {
              case 'tile':
                return (
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
                )
              case 'object':
                return layer.data.map((object, j) => (
                  <div
                    key={`object-${layer.id}-${j}`}
                    className={clsx(
                      'absolute border border-black pointer-events-none',
                      {
                        hidden: !layer.isVisible,
                      }
                    )}
                    style={{
                      top: object.y2 > object.y ? object.y : object.y2,
                      left: object.x2 > object.x ? object.x : object.x2,
                      width: object.width,
                      height: object.height,
                    }}
                  ></div>
                ))
              case 'structure':
                return layer.data.map((structure) => {
                  const { x, y, fileId } = structure
                  const file = files.find((f) => f.id === fileId)

                  if (!file) {
                    return null
                  }

                  const src = convertFileToImageData(file)

                  return (
                    <Structure
                      key={`structure-${structure.id}`}
                      x={x}
                      y={y}
                      src={src}
                      id={structure.id}
                      isVisible={layer.isVisible}
                      onClick={() => {
                        if (
                          currentLayer?.type === 'structure' &&
                          tool.type === 'eraser'
                        ) {
                          dispatch({
                            type: 'REMOVE_STRUCTURE',
                            id: structure.id,
                          })
                        } else if (
                          currentLayer?.type === 'structure' &&
                          tool.type === 'structure'
                        ) {
                          const cursor = cursorRef.current
                          if (!cursor) return

                          const { top, left } = cursor.style
                          const x = parseInt(left)
                          const y = parseInt(top)

                          dispatch({
                            type: 'ADD_STRUCTURE',
                            fileId,
                            x,
                            y,
                          })
                        }
                      }}
                    />
                  )
                })
            }
          })}
      </div>
    </div>
  )
}
