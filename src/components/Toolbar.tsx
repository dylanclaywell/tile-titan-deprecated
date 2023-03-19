import React, { useContext } from 'react'

import { EditorContext } from '../contexts/EditorContext'
import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tool'

export function Toolbar() {
  const [, { dispatch }] = useContext(EditorContext)

  return (
    <Tools classes="grow shrink-0 border-black">
      <ToolSection>
        <Tool name="Save" icon="floppy-disk" onClick={() => undefined} />
        <Tool
          name="New File"
          icon="file-circle-plus"
          onClick={() => {
            dispatch({ type: 'ADD_FILE' })
          }}
        />
      </ToolSection>
    </Tools>
  )
}
