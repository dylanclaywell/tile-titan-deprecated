import React, { useContext, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { clamp } from '../../utils/clamp'
import { Tile } from './Tile'
import { GridOverlay } from './GridOverlay'
import { convertFileToImageData } from '../../utils/convertFileToImageData'
import { addStructure, getCursorPosition, getTileImage } from '../../tools'
import { Cursor } from './Cursor'
import { Structure } from '../Structure/Structure'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  removeStructure,
  updateTilemap,
  zoomIn,
  zoomOut,
} from '../../features/editor/editorSlice'
import { moveCursor } from '../../features/cursor/cursorSlice'
import { CursorContext } from '../../contexts/CursorContext'
import { calculateNewCursorPosition } from '../../features/cursor/calculateNewCursorPosition'
import { isTileCursorMetadata } from '../../features/cursor/helpers'

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
  const cursorMetadata = useAppSelector((state) => state.cursor.metadata)
  const cursorImage = useAppSelector((state) => state.cursor.image)
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

  function handleLeftMouseButtonWithDrag(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    if (!currentLayer || !cursor) return

    const position = getCursorPosition({
      cursor,
      tileWidth,
      tileHeight,
      tilemapWidth: width,
      tilemapHeight: height,
    })

    if (!position) return

    if (toolType === 'add') {
      if (currentLayer.type === 'tile') {
        const image = getTileImage(e)
        if (!isTileCursorMetadata(cursorMetadata)) return

        if (!image) return
        image.src = cursorImage ?? ''

        dispatch(
          updateTilemap({
            layerId: currentLayer.id,
            tileX: position.cursorX,
            tileY: position.cursorY,
            tilesetX: cursorMetadata.tilesetX ?? -1,
            tilesetY: cursorMetadata.tilesetY ?? -1,
            tilesetName: cursorMetadata.tilesetName ?? 'unknown',
            tileData: image.src,
          })
        )
      }
    } else if (toolType === 'remove') {
      if (currentLayer.type === 'tile') {
        const image = getTileImage(e)
        if (!image) return
        image.src = ''

        dispatch(
          updateTilemap({
            layerId: currentLayer.id,
            tileX: position.cursorX,
            tileY: position.cursorY,
            tilesetX: -1,
            tilesetY: -1,
            tilesetName: '',
            tileData: '',
          })
        )
      }
    }
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

        const position = calculateNewCursorPosition({
          e,
          anchor: gridRef,
          cursor,
          tileHeight,
          tileWidth,
          zoomLevel,
        })

        dispatch(moveCursor({ x: position?.x ?? 0, y: position?.y ?? 0 }))

        if (
          mouseState.leftMouseButtonIsDown &&
          currentLayer.type !== 'object'
        ) {
          handleLeftMouseButtonWithDrag(e)
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

        handleMouseDown(e, gridRef)
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
                          toolType === 'remove'
                        ) {
                          dispatch(removeStructure({ id: structure.id }))
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
