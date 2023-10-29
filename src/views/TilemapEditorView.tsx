import React from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { Toolbar } from '../components/TilemapEditor/Toolbar'
import { useAppSelector } from '../hooks/redux'
import { selectCurrentLayer } from '../features/editor/selectors'

export function TilemapEditorView() {
  const layer = useAppSelector(selectCurrentLayer)
  const toolType = useAppSelector((state) => state.cursor.toolType)

  return (
    <div
      className={clsx('basis-[60vw] h-screen overflow-hidden border-gray-300', {
        'cursor-crosshair': layer?.type === 'object' && toolType === 'add',
      })}
    >
      <Toolbar />
      <TilemapEditor />
    </div>
  )
}
