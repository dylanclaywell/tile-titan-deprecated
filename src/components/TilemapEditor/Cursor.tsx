import React, { useContext, MutableRefObject, useMemo } from 'react'
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
      className={clsx({
        'bg-blue-600 p-4 absolute pointer-events-none bg-opacity-75 opacity-75 z-50':
          layerType !== 'object',
        'bg-transparent absolute pointer-events-none border border-black':
          layerType === 'object',
      })}
      ref={(el) => setCursor(el)}
      style={{
        width: 32,
        height: 32,
      }}
    >
      <img
        className="absolute top-0 left-0 pointer-events-none"
        src={cursorImage ?? ''}
        alt="cursor"
        // width={width}
        // height={height}
      />
    </div>
  )
}
