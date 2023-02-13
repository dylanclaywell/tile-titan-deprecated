import React from 'react'
import clsx from 'clsx'

export interface Props {
  name: string
  icon: string
  classes?: string
  isSelected?: boolean
  onClick: () => void
}

export function Tool({ name, icon, isSelected, classes, onClick }: Props) {
  return (
    <button
      title={name}
      className={clsx(
        'w-10 h-10 cursor-default hover:bg-gray-200 hover:border hover:border-gray-300 rounded-md',
        classes,
        {
          'bg-gray-300 border border-gray-400': isSelected,
        }
      )}
      onClick={onClick}
    >
      <i className={`fa-solid fa-${icon}`}></i>
    </button>
  )
}
