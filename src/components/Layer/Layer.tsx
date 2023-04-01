import React, { useState } from 'react'
import clsx from 'clsx'

import { LayerButton } from './LayerButton'
import { LayerType } from '../../types/layer'
import {
  removeLayer,
  updateLayerSettings,
} from '../../features/editor/editorSlice'
import { useAppDispatch } from '../../hooks/redux'

export interface Props {
  id: string
  type: 'tile' | 'object'
  sortOrder: number
  isSelected: boolean
  isVisible: boolean
  name: string
  onClick: () => void
  onRename: (id: string) => void
  draggedLayer: LayerType | null
  onDragStart: React.DragEventHandler<HTMLDivElement>
  onDragEnd: React.DragEventHandler<HTMLDivElement>
}

export function Layer({
  id,
  type,
  sortOrder,
  isSelected,
  isVisible,
  name,
  onClick,
  onRename,
  draggedLayer,
  onDragStart,
  onDragEnd,
}: Props) {
  const [isHoveredWhileDragging, setIsHoveredWhileDragging] = useState(false)
  const dispatch = useAppDispatch()

  const isDragging = draggedLayer?.id === id

  return (
    <div
      className={clsx('w-full flex', {
        'bg-blue-400': isSelected && !isHoveredWhileDragging,
        'bg-blue-200': isHoveredWhileDragging,
        'bg-blue-100': isDragging,
      })}
      draggable
      onDrop={(event) => {
        event.preventDefault()

        if (!draggedLayer) return
        if (draggedLayer?.id === id) return

        dispatch(
          updateLayerSettings({
            id: draggedLayer.id,
            layer: { sortOrder },
          })
        )
        dispatch(
          updateLayerSettings({
            id,
            layer: { sortOrder: draggedLayer.sortOrder },
          })
        )
        setIsHoveredWhileDragging(false)
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()

        if (draggedLayer?.id === id) return

        setIsHoveredWhileDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()

        setIsHoveredWhileDragging(false)
      }}
    >
      <button onClick={onClick} className="flex-grow pl-2 text-left space-x-2">
        <i
          className={clsx('fa-solid text-gray-600', {
            'fa-image': type === 'tile',
            'fa-object-group': type === 'object',
          })}
        ></i>
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
          onClick={() => onRename(id)}
        />
        <LayerButton
          name={isVisible ? 'Hide' : 'Show'}
          classes={clsx({
            'hover:text-yellow-600': !isSelected,
            'hover:text-yellow-700': isSelected,
          })}
          iconName={isVisible ? 'eye' : 'eye-slash'}
          onClick={() =>
            dispatch(
              updateLayerSettings({ id, layer: { isVisible: !isVisible } })
            )
          }
        />
        <LayerButton
          name="Delete"
          classes={clsx({
            'hover:text-red-500': !isSelected,
            'hover:text-red-600': isSelected,
          })}
          iconName="trash-can"
          onClick={() => dispatch(removeLayer({ id }))}
        />
      </div>
    </div>
  )
}
