import React, { useContext } from 'react'

import { EditorContext } from '../contexts/EditorContext'
import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tool'

export function Toolbar() {
  const [, { addFile }] = useContext(EditorContext)

  return (
    <Tools classes="grow shrink-0 border-black">
      <ToolSection>
        <Tool name="New File" icon="file-circle-plus" onClick={addFile} />
      </ToolSection>
    </Tools>
  )
}
