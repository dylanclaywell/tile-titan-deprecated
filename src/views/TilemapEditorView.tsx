import React from 'react'
import clsx from 'clsx'

import { TilemapEditor } from '../components/TilemapEditor/TilemapEditor'
import { Toolbar } from '../components/TilemapEditor/Toolbar'
import { useAppSelector } from '../hooks/redux'
import { selectCurrentLayer } from '../features/editor/selectors'

export function TilemapEditorView() {
  const layer = useAppSelector(selectCurrentLayer)

  return (
    <div
      className={clsx('basis-[60vw] h-screen overflow-hidden border-black', {
        'cursor-crosshair': layer?.type === 'object',
      })}
    >
      <Toolbar />
      <TilemapEditor />
    </div>
  )
}
