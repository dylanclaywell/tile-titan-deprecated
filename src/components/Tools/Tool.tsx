import React, { useContext } from 'react'
import clsx from 'clsx'

import { ToolContext, ToolType } from '../../contexts/ToolContext'

export interface Props {
  type: ToolType
  icon: string
}

export function Tool({ type, icon }: Props) {
  const [toolState, { handleToolClick: setTool }] = useContext(ToolContext)

  return (
    <button
      title="Delete"
      className={clsx(
        'w-10 h-10 cursor-default hover:bg-gray-200 hover:border hover:border-gray-300 rounded-md',
        {
          'bg-gray-300 border border-gray-400':
            toolState.tool.type === type ||
            (type === 'grid' && toolState.showGrid),
        }
      )}
      onClick={() => {
        setTool(type)
      }}
    >
      <i className={`fa-solid fa-${icon}`}></i>
    </button>
  )
}
