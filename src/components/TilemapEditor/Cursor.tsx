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
  const tool = useAppSelector((state) => state.editor.tool)

  return (
    <div
      className={clsx({
        'bg-blue-600 p-4 absolute pointer-events-none bg-opacity-75 opacity-75 z-50':
          tool.type !== 'object',
        'bg-transparent absolute pointer-events-none border border-black':
          tool.type === 'object',
      })}
      ref={(el) => setCursor(el)}
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
