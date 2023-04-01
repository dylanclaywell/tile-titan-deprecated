import React from 'react'

import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tool'
import { addFile } from '../features/editor/editorSlice'
import { useAppDispatch } from '../hooks/redux'

export function Toolbar() {
  const dispatch = useAppDispatch()

  return (
    <Tools classes="grow shrink-0 border-black">
      <ToolSection>
        <Tool name="Save" icon="floppy-disk" onClick={() => undefined} />
        <Tool
          name="New File"
          icon="file-circle-plus"
          onClick={() => {
            dispatch(addFile())
          }}
        />
      </ToolSection>
    </Tools>
  )
}
