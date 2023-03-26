import React, { useEffect, useContext, MutableRefObject, useMemo } from 'react'
import clsx from 'clsx'

import { EditorContext } from '../../contexts/EditorContext'
import { LayerType } from '../../types/layer'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function Cursor() {
  const [{ tool, selectedFileId, files }, { setCursorRef }] =
    useContext(EditorContext)

  const currentFile = useMemo(
    () => files.find((file) => file.id === selectedFileId),
    [selectedFileId]
  )

  return (
    <div
      className={clsx(
        'p-4 absolute pointer-events-none bg-opacity-75 opacity-75 z-50',
        {
          'bg-blue-600': tool.type !== 'object',
          'bg-transparent': tool.type === 'object',
        }
      )}
      ref={(el) => setCursorRef(el)}
      style={{
        width: tool.width,
        height: tool.height,
      }}
    >
      <img
        className="absolute top-0 left-0"
        src={tool.src}
        alt="cursor"
        width={tool.width}
        height={tool.height}
      />
    </div>
  )
}
