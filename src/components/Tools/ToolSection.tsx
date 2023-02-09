import React from 'react'

import { Tool } from './Tool'

interface Props {
  children: React.ReactNode
}

export function ToolSection({ children }: Props) {
  return <div className="flex gap-2 px-2 border-gray-300">{children}</div>
}
