import React, { useContext } from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'
import { Tool } from '../components/Tool'
import { SettingsModal } from '../components/TilemapEditor/SettingsModal'
import { EditorContext } from '../contexts/EditorContext'

export function TilemapEditorView() {
  const [
    { files, selectedLayerId, tool, showGrid, selectedFileId },
    { dispatch },
  ] = useContext(EditorContext)
  const [showSettings, setShowSettings] = React.useState(false)

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )
  const layerType = currentLayer?.type

  return (
    <div
      className={clsx('basis-[60vw] h-screen overflow-hidden border-black', {
        'cursor-crosshair': tool.type === 'object',
      })}
    >
      <Tools>
        <ToolSection>
          <Tool
            name="Save"
            onClick={() => {
              const file = new Blob(
                [JSON.stringify(currentLayer?.data, null, 2)],
                {
                  type: 'application/json',
                }
              )
              const url = URL.createObjectURL(file)
              const a = document.createElement('a')
              a.href = url
              a.download = 'tilemap.json'
              a.click()
            }}
            icon="floppy-disk"
            isDisabled={!currentLayer}
          />
        </ToolSection>
        <ToolSection>
          {layerType === 'tilelayer' ? (
            <>
              <Tool
                name="Tile"
                onClick={() =>
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'tile' })
                }
                isSelected={tool.type === 'tile'}
                icon="image"
                isDisabled={!currentLayer}
              />
              <Tool
                name="Erase"
                onClick={() =>
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'eraser' })
                }
                isSelected={tool.type === 'eraser'}
                icon="eraser"
                isDisabled={!currentLayer}
              />
            </>
          ) : (
            <>
              <Tool
                name="Select"
                onClick={() =>
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'select' })
                }
                isSelected={tool.type === 'select'}
                icon="arrow-pointer"
                isDisabled={!currentLayer}
              />
              <Tool
                name="Object"
                onClick={() =>
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'object' })
                }
                isSelected={tool.type === 'object'}
                icon="vector-square"
                isDisabled={!currentLayer}
              />
              <Tool
                name="Erase"
                onClick={() =>
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'eraser' })
                }
                isSelected={tool.type === 'eraser'}
                icon="eraser"
                isDisabled={!currentLayer}
              />
            </>
          )}
        </ToolSection>
        <ToolSection>
          <Tool
            name="Show Grid"
            onClick={() =>
              dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'grid' })
            }
            isSelected={showGrid}
            icon="border-all"
            isDisabled={!currentLayer}
          />
        </ToolSection>
        <ToolSection>
          <Tool
            name="Tilemap Settings"
            onClick={() => {
              setShowSettings(true)
            }}
            icon="gear"
            isDisabled={!currentLayer}
          />
        </ToolSection>
      </Tools>
      <TilemapEditor
        layers={currentFile?.layers ?? []}
        currentLayer={currentLayer}
        onTileClick={(args) => {
          dispatch({ type: 'UPDATE_TILEMAP', ...args })
        }}
      />
      {currentFile !== undefined && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => {
            setShowSettings(false)
          }}
        />
      )}
    </div>
  )
}
