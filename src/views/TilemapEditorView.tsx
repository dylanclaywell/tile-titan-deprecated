import React from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { Toolbar } from '../components/TilemapEditor/Toolbar'
import { updateTilemap } from '../features/editor/editorSlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'

export function TilemapEditorView() {
  const dispatch = useAppDispatch()
  const { files, selectedLayerId, tool, selectedFileId } = useAppSelector(
    (state) => ({
      files: state.editor.files,
      selectedLayerId: state.editor.selectedLayerId,
      tool: state.editor.tool,
      selectedFileId: state.editor.selectedFileId,
    })
  )

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
          dispatch(updateTilemap(args))
        }}
      />
    </div>
  )
}
