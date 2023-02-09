import React from 'react'

import { TilemapType } from '../types/tilemap'
import { TilemapEditor } from './TilemapEditor'
import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tools/Tool'
import { TilemapEditorSettings } from './TilemapEditorSettings'
import { generateMap } from '../utils/generateMap'

const initialTilemap: TilemapType = {
  name: 'Test',
  tileWidth: 32,
  tileHeight: 32,
  width: 10,
  height: 10,
  data: generateMap(10, 10),
}

export function TilemapEditorView() {
  const [showSettings, setShowSettings] = React.useState(false)
  const [tilemap, setTilemap] = React.useState<TilemapType>(initialTilemap)

  return (
    <div className="basis-[70vw] h-screen">
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
      <TilemapEditor tilemap={tilemap} />
      <TilemapEditorSettings
        isOpen={showSettings}
        updateTilemap={setTilemap}
        onClose={() => {
          setShowSettings(false)
        }}
        tilemap={tilemap}
      />
    </div>
  )
}
