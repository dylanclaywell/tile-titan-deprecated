import React, { useState } from 'react'
import clsx from 'clsx'

import { Button } from './Button'
import { LayerType } from '../../types/layer'

export interface Props {
  id: string
  icon?: string
  sortOrder: number
  isSelected: boolean
  isVisible?: boolean
  name: string
  onClick: () => void
  onRename?: (id: string) => void
  draggedId: string | null
  onDragStart: React.DragEventHandler<HTMLDivElement>
  onDragEnd: React.DragEventHandler<HTMLDivElement>
  onDrop: React.DragEventHandler<HTMLDivElement>
  onHide?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ResourceListItem({
  id,
  icon,
  isSelected,
  isVisible = true,
  name,
  onClick,
  onRename,
  draggedId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
  onHide,
}: Props) {
  const [isHoveredWhileDragging, setIsHoveredWhileDragging] = useState(false)

  const isDragging = draggedId === id

  return (
    <div
      className={clsx('w-full flex', {
        'bg-blue-400': isSelected && !isHoveredWhileDragging,
        'bg-blue-200': isHoveredWhileDragging,
        'bg-blue-100': isDragging,
      })}
      draggable
      onDrop={(event) => {
        onDrop(event)
        setIsHoveredWhileDragging(false)
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()

        if (draggedId === id) return

        setIsHoveredWhileDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()

        setIsHoveredWhileDragging(false)
      }}
    >
      <button onClick={onClick} className="flex-grow pl-2 text-left space-x-2">
        {icon && <i className={clsx('fa-solid text-gray-600', icon)}></i>}
        <span>{name}</span>
      </button>
      <div className="flex justify-end gap-2 p-2">
        {onRename && (
          <Button
            name="Rename"
            classes={clsx({
              'hover:text-green-600': !isSelected,
              'hover:text-green-700': isSelected,
            })}
            iconName="pencil"
            onClick={() => onRename(id)}
          />
        )}
        {onHide && (
          <Button
            name={isVisible ? 'Hide' : 'Show'}
            classes={clsx({
              'hover:text-yellow-600': !isSelected,
              'hover:text-yellow-700': isSelected,
            })}
            iconName={isVisible ? 'eye' : 'eye-slash'}
            onClick={() => onHide(id)}
          />
        )}
        {onDelete && (
          <Button
            name="Delete"
            classes={clsx({
              'hover:text-red-500': !isSelected,
              'hover:text-red-600': isSelected,
            })}
            iconName="trash-can"
            onClick={() => onDelete(id)}
          />
        )}
      </div>
    </div>
  )
}
