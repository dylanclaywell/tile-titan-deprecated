import React from 'react'

import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tool'
import { addFile } from '../features/editor/editorSlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { saveFiles } from '../utils/saveFiles'

export function Toolbar() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.editor.files)

  return (
    <Tools classes="grow shrink-0 border-black">
      <ToolSection>
        <Tool name="Save" icon="floppy-disk" onClick={() => saveFiles(files)} />
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
