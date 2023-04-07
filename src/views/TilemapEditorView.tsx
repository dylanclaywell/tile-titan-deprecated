import React from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { Toolbar } from '../components/TilemapEditor/Toolbar'
import { useAppSelector } from '../hooks/redux'

export function TilemapEditorView() {
  const { tool } = useAppSelector((state) => ({
    files: state.editor.files,
    selectedLayerId: state.editor.selectedLayerId,
    tool: state.editor.tool,
    selectedFileId: state.editor.selectedFileId,
  }))

  return (
    <div
      className={clsx('basis-[60vw] h-screen overflow-hidden border-black', {
        'cursor-crosshair': tool.type === 'object',
      })}
    >
      <Toolbar />
      <TilemapEditor />
    </div>
  )
}
