import React from 'react'
import clsx from 'clsx'

import { LayerButton } from './LayerButton'

export interface Props {
  isSelected: boolean
  name: string
  onClick: () => void
}

export function Layer({ isSelected, name, onClick }: Props) {
  return (
    <div
      className={clsx('w-full flex', {
        'bg-blue-400': isSelected,
      })}
    >
      <button onClick={onClick} className="flex-grow pl-2 text-left">
        <span>{name}</span>
      </button>
      <div className="flex justify-end gap-2 p-2">
        <LayerButton
          name="Rename"
          classes={clsx({
            'hover:text-green-600': !isSelected,
            'hover:text-green-700': isSelected,
          })}
          iconName="pencil"
          onClick={() => undefined}
        />
        <LayerButton
          name="Delete"
          classes={clsx({
            'hover:text-red-500': !isSelected,
            'hover:text-red-600': isSelected,
          })}
          iconName="trash-can"
          onClick={() => undefined}
        />
      </div>
    </div>
  )
}
