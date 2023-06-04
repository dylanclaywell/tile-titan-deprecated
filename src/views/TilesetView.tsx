import React, { useState, useEffect, useCallback } from 'react'

import { TilesetUploader } from '../components/TilesetUploader'
import { Tool } from '../components/Tool'
import { SelectField } from '../components/SelectField'
import { ToolSection } from '../components/Tools/ToolSection'
import { Tools } from '../components/Tools/Tools'
import { TilesetSettingsModal } from '../components/TilesetSettingsModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  addTileCursorMetadata,
  changeToolType,
  setCursorMetadata,
  setCursorSize,
  setCursorSrc,
} from '../features/cursor/cursorSlice'
import { Type as LayerType } from '../types/layer'
import { deleteTileset, renameTileset } from '../features/editor/editorSlice'

function TilesetViewBase({ layerType }: { layerType: LayerType }) {
  const dispatch = useAppDispatch()
  const metadata = useAppSelector((state) => state.cursor.metadata)
  const tilesets = useAppSelector((state) => state.editor.tilesets)
  const [tilesetSettingsIsOpen, setTilesetSettingsIsOpen] = useState(false)
  const [cursorRef, setCursorRef] = useState<HTMLDivElement | null>(null)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [selectedTilesetId, setSelectedTilesetId] = useState<string | null>(
    null
  )

  const refreshTilesets = useCallback(() => {
    setSelectedTilesetId(tilesets[0]?.id ?? null)
  }, [tilesets])

  useEffect(
    function loadTilesets() {
      refreshTilesets()
    },
    [refreshTilesets]
  )

  useEffect(function registerEventListeners() {
    function handleMouseMove(event: MouseEvent) {
      if (
        !(event.target instanceof HTMLImageElement) ||
        event.target.id !== 'tileset'
      )
        return

      if (!cursorRef) return

      const area = cursorRef.querySelector('area')

      if (!area) return

      const x = Math.floor(event.offsetX / 32) * 32
      const y = Math.floor(event.offsetY / 32) * 32

      cursorRef.style.top = `${y}px`
      cursorRef.style.left = `${x}px`

      area.coords = `${x},${y},${x + 32},${y + 32}`
    }

    document.addEventListener('mousemove', handleMouseMove)

    return function cleanup() {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  })

  async function handleAreaClick(
    e: React.MouseEvent<HTMLAreaElement, MouseEvent>
  ) {
    e.preventDefault()

    if (!(e.target instanceof HTMLAreaElement) || !imageRef) return

    const coords = e.target.coords
    const [x1, y1, x2, y2] = coords.split(',').map((n) => parseInt(n))
    const tilesetX = x1 / 32
    const tilesetY = y1 / 32
    const tilesetName = e.target?.dataset?.['tilesetName'] ?? 'unknown'
    const tilesetId = e.target?.dataset?.['tilesetId'] ?? 'unknown'

    const width = x2 - x1
    const height = y2 - y1

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    context?.drawImage(imageRef, x1, y1, width, height, 0, 0, width, height)
    dispatch(setCursorSrc(canvas.toDataURL()))
    dispatch(
      setCursorMetadata([
        {
          tilesetId,
          tilesetName,
          tilesetX,
          tilesetY,
          offsetX: 0,
          offsetY: 0,
          tileImageData: canvas.toDataURL(),
        },
      ])
    )
    dispatch(setCursorSize({ width, height }))
    dispatch(changeToolType({ toolType: 'add' }))
  }

  function handleAddArea(e: React.MouseEvent<HTMLAreaElement, MouseEvent>) {
    e.preventDefault()

    if (!Array.isArray(metadata)) return

    if (!(e.target instanceof HTMLAreaElement) || !imageRef) return

    const coords = e.target.coords
    const [x1, y1, x2, y2] = coords.split(',').map((n) => parseInt(n))
    const tileWidth = x2 - x1
    const tileHeight = y2 - y1
    const tilesetX = x1 / tileWidth
    const tilesetY = y1 / tileWidth
    const tilesetName = e.target?.dataset?.['tilesetName'] ?? 'unknown'
    const tilesetId = e.target?.dataset?.['tilesetId'] ?? 'unknown'

    const preMetadata = [
      ...metadata,
      {
        tilesetId,
        tilesetName,
        tilesetX,
        tilesetY,
      },
    ]

    const xs = preMetadata.map((m) => m.tilesetX)
    const ys = preMetadata.map((m) => m.tilesetY)

    const maxX = Math.max(...xs)
    const minX = Math.min(...xs)
    const maxY = Math.max(...ys)
    const minY = Math.min(...ys)

    const width = (maxX - minX + 1) * tileWidth
    const height = (maxY - minY + 1) * tileHeight

    const tileCanvas = document.createElement('canvas')
    tileCanvas.width = tileWidth
    tileCanvas.height = tileHeight
    const tileContext = tileCanvas.getContext('2d')

    const cursorCanvas = document.createElement('canvas')
    cursorCanvas.width = width
    cursorCanvas.height = height
    const cursorContext = cursorCanvas.getContext('2d')

    const newMetadata = []

    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const x = i * tileWidth
        const y = j * tileHeight

        // This draws to the cursor image to show the entire selected area, not just the one tile itself
        cursorContext?.drawImage(
          imageRef,
          x,
          y,
          tileWidth,
          tileHeight,
          i * tileWidth - minX * tileWidth,
          j * tileHeight - minY * tileHeight,
          tileWidth,
          tileHeight
        )

        // This draws just the tile image to the tile image canvas
        tileContext?.drawImage(
          imageRef,
          x,
          y,
          tileWidth,
          tileHeight,
          0,
          0,
          tileWidth,
          tileHeight
        )

        // The way the newMetadata above is defined is by adding only the new tile that the
        // mouse moved into. This means that if a rectangular area is selected, the
        // metadata will only contain the new tile. To fix this, we need to add all the tiles
        // in the area to the metadata, not just the new tile.
        newMetadata.push({
          tilesetId,
          tilesetName,
          tilesetX: i,
          tilesetY: j,
          offsetX: i - minX,
          offsetY: j - minY,
          tileImageData: tileCanvas.toDataURL(),
        })

        tileContext?.clearRect(0, 0, tileCanvas.width, tileCanvas.height)
      }
    }

    dispatch(setCursorSrc(cursorCanvas.toDataURL()))
    dispatch(setCursorMetadata(newMetadata))
    dispatch(setCursorSize({ width, height }))
    dispatch(changeToolType({ toolType: 'add' }))
  }

  const currentTileset = tilesets.find(
    (tileset) => tileset.id === selectedTilesetId
  )

  return (
    <div className="h-0 flex flex-col flex-1 border-gray-600">
      <Tools>
        <ToolSection>
          <SelectField
            options={tilesets.map((tileset) => ({
              value: tileset.id,
              label: tileset.name,
            }))}
            onChange={(value) => {
              setSelectedTilesetId(value)
            }}
            value={selectedTilesetId ?? ''}
            inputProps={{
              className: 'w-full',
            }}
          />
        </ToolSection>
        <ToolSection>
          <TilesetUploader
            refreshTilesets={refreshTilesets}
            label={
              <div className="w-10 h-10 cursor-default hover:bg-gray-200 hover:border hover:border-gray-300 rounded-md flex justify-center items-center">
                <i className="fa-solid fa-file-circle-plus"></i>
              </div>
            }
          />
        </ToolSection>
        <ToolSection>
          <Tool
            icon="trash-can"
            name="Delete tileset"
            onClick={() =>
              dispatch(deleteTileset({ id: currentTileset?.id ?? '' }))
            }
          />
          <Tool
            icon="gear"
            name="Tileset settings"
            onClick={() => setTilesetSettingsIsOpen(true)}
          />
        </ToolSection>
      </Tools>
      <div className="overflow-auto h-full flex-1 border-gray-300">
        {currentTileset && (
          <div className="h-full">
            <div key={currentTileset.id} className="relative h-full">
              <img
                ref={(el) => setImageRef(el)}
                className="max-w-none"
                src={currentTileset.blob}
                alt="tileset"
                id="tileset"
                useMap={`#tileset-map`}
              />
              <div
                ref={(el) => setCursorRef(el)}
                className="absolute bg-blue-600 z-40 w-8 h-8 pointer-events-none opacity-50"
              >
                <map name="tileset-map">
                  <area
                    onMouseDown={handleAreaClick}
                    onMouseOver={(e) => {
                      if (e.buttons === 1) {
                        handleAddArea(e)
                      }
                    }}
                    shape="rect"
                    href="#"
                    alt="tile"
                    data-tileset-name={currentTileset.name}
                    data-tileset-id={currentTileset.id}
                  />
                </map>
              </div>
            </div>
          </div>
        )}
      </div>
      <TilesetSettingsModal
        isOpen={tilesetSettingsIsOpen}
        onSubmit={async (values) => {
          const tilesetId = currentTileset?.id ?? ''

          if (!tilesetId) return

          dispatch(renameTileset({ id: tilesetId, name: values.name }))
          await refreshTilesets()
          setSelectedTilesetId(tilesetId)
        }}
        tilesetName={currentTileset?.name ?? ''}
        onClose={() => setTilesetSettingsIsOpen(false)}
      />
    </div>
  )
}

const TilesetViewMemoized = React.memo(TilesetViewBase)

export function TilesetView() {
  const { selectedLayerId, selectedFileId, files } = useAppSelector(
    (state) => ({
      selectedLayerId: state.editor.selectedLayerId,
      selectedFileId: state.editor.selectedFileId,
      files: state.editor.files,
    })
  )

  const file = files.find((file) => file.id === selectedFileId)
  const layer = file?.layers.find((layer) => layer.id === selectedLayerId)

  return <TilesetViewMemoized layerType={layer?.type ?? 'tile'} />
}
