import React from 'react'
import clsx from 'clsx'

export interface Props {
  children: React.ReactNode
  classes?: string
}

export function Tools({ children, classes }: Props) {
  return (
    <div
      className={clsx(
        'flex items-center p-2 divide-x space-x-2 border-b border-gray-300 overflow-x-auto',
        classes
      )}
    >
      {children}
    </div>
  )
}
