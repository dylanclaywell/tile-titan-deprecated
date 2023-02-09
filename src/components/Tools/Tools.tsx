import React from 'react'
import { Tool } from './Tool'
import { ToolSection } from './ToolSection'

export function Tools() {
  return (
    <div className="flex p-2 divide-x">
      <ToolSection>
        <Tool type="tile" icon="image" />
        <Tool type="eraser" icon="eraser" />
      </ToolSection>
      <ToolSection>
        <Tool type="grid" icon="border-all" />
      </ToolSection>
    </div>
  )
}
