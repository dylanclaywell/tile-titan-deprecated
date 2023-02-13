import React, { useContext } from 'react'
import clsx from 'clsx'

import { LayerButton } from './LayerButton'
import { EditorContext } from '../../contexts/EditorContext'

export interface Props {
  id: string
  isSelected: boolean
  isVisible: boolean
  name: string
  onClick: () => void
}

export function Layer({ id, isSelected, isVisible, name, onClick }: Props) {
  const [, { updateLayerSettings }] = useContext(EditorContext)

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
          name="Rename"
          classes={clsx({
            'hover:text-yellow-600': !isSelected,
            'hover:text-yellow-700': isSelected,
          })}
          iconName={isVisible ? 'eye' : 'eye-slash'}
          onClick={() => updateLayerSettings(id, { isVisible: !isVisible })}
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
