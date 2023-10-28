import React, { useContext, MutableRefObject } from 'react'
import clsx from 'clsx'

import { LayerType } from '../../types/layer'
import { useAppSelector } from '../../hooks/redux'
import { CursorContext } from '../../contexts/CursorContext'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function Cursor() {
  const [, { setCursor }] = useContext(CursorContext)
  const toolType = useAppSelector((state) => state.cursor.toolType)
  const layerType = useAppSelector((state) => {
    const currentFile = state.editor.files.find(
      (file) => file.id === state.editor.selectedFileId
    )
    const currentLayer = currentFile?.layers.find(
      (layer) => layer.id === state.editor.selectedLayerId
    )
    return currentLayer?.type
  })
  const cursorImage = useAppSelector((state) => state.cursor.image)
  const width = useAppSelector((state) => state.cursor.width)
  const height = useAppSelector((state) => state.cursor.height)

  return (
    <div
      className={clsx('absolute', {
        'bg-blue-600 pointer-events-none bg-opacity-75 opacity-75 z-50':
          (layerType === 'tile' && toolType === 'add') ||
          (layerType === 'structure' && toolType === 'add'),
        'bg-red-600 pointer-events-none bg-opacity-75 opacity-75 z-50':
          layerType === 'tile' && toolType === 'remove',
        'bg-transparent pointer-events-none border border-black':
          layerType === 'object',
      })}
      ref={(el) => setCursor(el)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        visibility: layerType === 'object' ? 'hidden' : 'visible',
      }}
    >
      <img
        className={clsx('absolute top-0 left-0 pointer-events-none', {
          hidden:
            !cursorImage ||
            (layerType === 'structure' && toolType !== 'add') ||
            (layerType === 'tile' && toolType === 'remove') ||
            (layerType === 'object' && toolType === 'add'),
          block: cursorImage || (layerType === 'tile' && toolType === 'add'),
        })}
        src={cursorImage ?? ''}
        alt="cursor"
        width={width}
        height={height}
      />
    </div>
  )
}
