import React from 'react'

export interface Props {
  children: React.ReactNode
}

export function ResourceList({ children }: Props) {
  return <div className="p-2 border-gray-300">{children}</div>
}
