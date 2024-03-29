import React from 'react'

import { Tools } from './Tools/Tools'
import { ToolSection } from './Tools/ToolSection'
import { Tool } from './Tool'
import { addFile, setFiles, setTilesets } from '../features/editor/editorSlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { FileUploader } from './FileUploader'
import { exportProject } from '../lib/exportProject'
import { importProject } from '../lib/importProject'

async function readZipFile(file: File) {
  return new Promise<string | ArrayBuffer | null | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result)
    }
    reader.readAsBinaryString(file)
  })
}

export function Toolbar() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.editor.files)
  const tilesets = useAppSelector((state) => state.editor.tilesets)

  return (
    <Tools classes="grow shrink-0 border-black">
      <ToolSection>
        <FileUploader
          label={
            <div className="w-10 h-10 cursor-default hover:bg-gray-200 hover:border hover:border-gray-300 rounded-md flex justify-center items-center">
              <i className="fa-solid fa-upload"></i>
            </div>
          }
          name="Import Project"
          onChange={async (event) => {
            const file = event.target.files?.[0]

            if (!file) return

            const blob = await readZipFile(file)

            if (!blob) return

            const { files, tilesets } = await importProject(blob)

            dispatch(setFiles(files))
            dispatch(setTilesets(tilesets))

            event.target.value = ''
          }}
        />
        <Tool
          name="Export Project"
          icon="download"
          onClick={() => exportProject(files, tilesets)}
        />
      </ToolSection>
      <ToolSection>
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
