import React, { useCallback, useContext } from 'react'

import { TilemapType } from '../types/tilemap'
import { TilemapEditor } from '../components/TilemapEditor'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'
import { Tool } from '../components/Tools/Tool'
import { TilemapEditorSettings } from '../components/TilemapEditor/Settings'
import { generateMap } from '../utils/generateMap'
import { EditorContext } from '../contexts/EditorContext'

const initialTilemap: TilemapType = {
  name: 'Test',
  tileWidth: 32,
  tileHeight: 32,
  width: 10,
  height: 10,
  data: generateMap(10, 10),
}

export function TilemapEditorView() {
  const [
    { layers, selectedLayerId },
    { updateTilemap, updateTilemapSettings },
  ] = useContext(EditorContext)
  const [showSettings, setShowSettings] = React.useState(false)
  // const [tilemap, setTilemap] = React.useState<TilemapType>(initialTilemap)

  const tilemap = layers.find((layer) => layer.id === selectedLayerId)?.tilemap

  // const updateTile = useCallback(
  //   ({
  //     tileX,
  //     tileY,
  //     tilesetX,
  //     tilesetY,
  //     tilesetName,
  //   }: {
  //     tileX: number
  //     tileY: number
  //     tilesetX: number
  //     tilesetY: number
  //     tilesetName: string
  //   }) => {
  //     setTilemap((tilemap) => {
  //       const newTilemap = { ...tilemap }
  //       newTilemap.data[tileY][tileX] = {
  //         tilesetName,
  //         tilesetX,
  //         tilesetY,
  //       }
  //       return newTilemap
  //     })
  //   },
  //   []
  // )

  return (
    <div className="basis-[70vw] h-screen overflow-hidden">
      <Tools>
        <ToolSection>
          <Tool
            name="Save"
            onClick={() => {
              const file = new Blob([JSON.stringify(tilemap, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(file)
              const a = document.createElement('a')
              a.href = url
              a.download = 'tilemap.json'
              a.click()
            }}
            icon="floppy-disk"
          />
        </ToolSection>
        <ToolSection>
          <Tool name="Tile" type="tile" icon="image" />
          <Tool name="Erase" type="eraser" icon="eraser" />
        </ToolSection>
        <ToolSection>
          <Tool name="Show Grid" type="grid" icon="border-all" />
        </ToolSection>
        <ToolSection>
          <Tool
            name="Tilemap Settings"
            onClick={() => {
              setShowSettings(true)
            }}
            icon="gear"
          />
        </ToolSection>
      </Tools>
      <TilemapEditor tilemap={tilemap} onTileClick={updateTilemap} />
      {tilemap !== undefined && (
        <TilemapEditorSettings
          isOpen={showSettings}
          updateTilemap={updateTilemapSettings}
          onClose={() => {
            setShowSettings(false)
          }}
          tilemap={tilemap}
        />
      )}
    </div>
  )
}
