import React, { useContext } from 'react'
import clsx from 'clsx'

import { EditorContext, ToolType } from '../../contexts/ToolContext'

type BaseProps = {
  name: string
  icon: string
}

export type Props =
  | (BaseProps & {
      type: ToolType
    })
  | (BaseProps & {
      onClick: () => void
    })

export function Tool({ name, icon, ...rest }: Props) {
  const [toolState, { handleToolClick: setTool }] = useContext(EditorContext)

  return (
    <button
      title={name}
      className={clsx(
        'w-10 h-10 cursor-default hover:bg-gray-200 hover:border hover:border-gray-300 rounded-md',
        {
          'bg-gray-300 border border-gray-400':
            'type' in rest &&
            (toolState.tool.type === rest.type ||
              (rest.type === 'grid' && toolState.showGrid)),
        }
      )}
      onClick={() => {
        'onClick' in rest ? rest.onClick() : setTool(rest.type)
      }}
    >
      <i className={`fa-solid fa-${icon}`}></i>
    </button>
  )
}
