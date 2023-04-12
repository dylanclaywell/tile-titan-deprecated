import React from 'react'
import { v4 as generateUuid } from 'uuid'

import { FileUploader } from './FileUploader'
import { readFile } from '../lib/readFile'
import { useAppDispatch } from '../hooks/redux'
import { addTileset } from '../features/editor/editorSlice'

export interface Props {
  refreshTilesets: () => void
  label: string | React.ReactNode
}

export function TilesetUploader({ refreshTilesets, label }: Props) {
  const dispatch = useAppDispatch()

  return (
    <FileUploader
      label={label}
      name="New tileset"
      onChange={async (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        const blob = await readFile(file, 'dataURL')
        dispatch(
          addTileset({
            id: generateUuid(),
            name: file.name,
            blob: blob?.toString(),
          })
        )
        refreshTilesets()
      }}
    />
  )
}
