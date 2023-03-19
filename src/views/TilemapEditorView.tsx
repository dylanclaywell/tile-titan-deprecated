import React, { useContext } from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { SettingsModal } from '../components/TilemapEditor/SettingsModal'
import { EditorContext } from '../contexts/EditorContext'
import { Toolbar } from '../components/TilemapEditor/Toolbar'

export function TilemapEditorView() {
  const [{ files, selectedLayerId, tool, selectedFileId }, { dispatch }] =
    useContext(EditorContext)
  const [showSettings, setShowSettings] = React.useState(false)

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )

  return (
    <div
      className={clsx('basis-[60vw] h-screen overflow-hidden border-black', {
        'cursor-crosshair': tool.type === 'object',
      })}
    >
      <Toolbar />
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
