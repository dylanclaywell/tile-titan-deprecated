import React from 'react'

import { FileUploader } from './FileUploader'
import { addTileset } from '../indexedDB/tileset'
import { readFile } from '../lib/readFile'

export interface Props {
  refreshTilesets: () => void
  label: string | React.ReactNode
}

export function TilesetUploader({ refreshTilesets, label }: Props) {
  return (
    <FileUploader
      label={label}
      name="New tileset"
      onChange={async (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        const blob = await readFile(file)
        addTileset(blob)
        refreshTilesets()
      }}
    />
  )
}
