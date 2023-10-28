import React, { useContext, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { clamp } from '../../utils/clamp'
import { Tile } from './Tile'
import { GridOverlay } from './GridOverlay'
import { addStructure } from '../../tools'
import { Cursor } from './Cursor'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { zoomIn, zoomOut } from '../../features/editor/editorSlice'
import { moveCursor } from '../../features/cursor/cursorSlice'
import { CursorContext } from '../../contexts/CursorContext'
import { calculateNewCursorPosition } from '../../features/cursor/calculateNewCursorPosition'
import { RenderedStructure } from '../Structure/RenderedStructure'
import Object from '../Object/Object'

export function TilemapEditor() {
  const [cursor, { handleMouseDown, handleMouseUp, handleMouseMove }] =
    useContext(CursorContext)
  const dispatch = useAppDispatch()
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [gridPosition, setGridPosition] = useState({
    x: 0,
    y: 0,
  })
  const [previousPosition, setPreviousPosition] = useState({
    x: 0,
    y: 0,
  })
  const { files, selectedFileId, selectedLayerId, showGrid, zoomLevel } =
    useAppSelector((state) => ({
      files: state.editor.files,
      selectedFileId: state.editor.selectedFileId,
      selectedLayerId: state.editor.selectedLayerId,
      showGrid: state.editor.showGrid,
      zoomLevel: state.editor.zoomLevel,
    }))
  const toolType = useAppSelector((state) => state.cursor.toolType)
  const [mouseState, setMouseState] = useState({
    leftMouseButtonIsDown: false,
    middleMouseButtonIsDown: false,
  })

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = useMemo(
    () => currentFile?.layers.find((layer) => layer.id === selectedLayerId),
    [currentFile, selectedLayerId]
  )
  const layers = currentFile?.layers ?? []

  const { width, height, tileWidth, tileHeight } = currentFile || {
    width: 0,
    height: 0,
    tileWidth: 0,
    tileHeight: 0,
  }

  return (
    <div
      id="tilemap-editor"
      onClick={() => {
        if (!cursor) return

        if (toolType === 'add' && currentLayer?.type === 'structure') {
          addStructure({
            cursor,
          })
        }
      }}
      onWheel={(e) => {
        const delta = e.deltaY

        if (delta > 0) {
          dispatch(zoomOut())
        } else if (delta < 0) {
          dispatch(zoomIn())
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

        if (currentLayer.type !== 'object') {
          const position = calculateNewCursorPosition({
            e,
            anchor: gridRef,
            cursor,
            tileHeight,
            tileWidth,
            zoomLevel,
          })

          dispatch(moveCursor({ x: position?.x ?? 0, y: position?.y ?? 0 }))
        }

        if (
          mouseState.leftMouseButtonIsDown &&
          currentLayer.type !== 'object'
        ) {
          handleMouseDown(e, gridRef)
        }

        handleMouseMove(e, gridRef)
      }}
      className="items-center flex justify-center bg-gray-200 relative h-[calc(100%-3.5rem-1px)]"
      onMouseDown={(e) => {
        if (e.button === 0) {
          setMouseState((state) => ({
            ...state,
            leftMouseButtonIsDown: true,
          }))

          handleMouseDown(e, gridRef)
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

        handleMouseUp(e, gridRef)
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
        {[...layers]
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
                            src={tile.tileData ?? ''}
                          />
                        )
                      })
                    })}
                  </div>
                )
              case 'object':
                return layer.data.map((object) => (
                  <Object
                    key={`object-${layer.id}-${object.id}`}
                    object={object}
                    layer={layer}
                  />
                ))
              case 'structure':
                return layer.data.map((structure) => {
                  return (
                    <RenderedStructure
                      key={structure.id}
                      structure={structure}
                    />
                  )
                })
            }
          })}
      </div>
    </div>
  )
}
