import React, { useContext } from 'react'

import { TilemapEditor } from '../components/TilemapEditor'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'
import { Tool } from '../components/Tool'
import { TilemapEditorSettings } from '../components/TilemapEditor/Settings'
import { EditorContext } from '../contexts/EditorContext'

export function TilemapEditorView() {
  const [
    { layers, selectedLayerId, tool, showGrid },
    { updateTilemap, updateTilemapSettings, handleToolClick },
  ] = useContext(EditorContext)
  const [showSettings, setShowSettings] = React.useState(false)

  const tilemap = layers.find((layer) => layer.id === selectedLayerId)?.tilemap

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
          <Tool
            name="Tile"
            onClick={() => handleToolClick('tile')}
            isSelected={tool.type === 'tile'}
            icon="image"
          />
          <Tool
            name="Erase"
            onClick={() => handleToolClick('eraser')}
            isSelected={tool.type === 'eraser'}
            icon="eraser"
          />
        </ToolSection>
        <ToolSection>
          <Tool
            name="Show Grid"
            onClick={() => handleToolClick('grid')}
            isSelected={showGrid}
            icon="border-all"
          />
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
