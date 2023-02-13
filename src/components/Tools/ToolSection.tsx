import React from 'react'

interface Props {
  children: React.ReactNode
}

export function ToolSection({ children }: Props) {
  return (
    <div className="flex first:pl-0 pl-2  gap-2 border-gray-300">
      {children}
    </div>
  )
}
