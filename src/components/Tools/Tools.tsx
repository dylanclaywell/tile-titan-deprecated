import React from 'react'

export interface Props {
  children: React.ReactNode
}

export function Tools({ children }: Props) {
  return (
    <div className="flex p-2 divide-x border-b border-gray-400">{children}</div>
  )
}
