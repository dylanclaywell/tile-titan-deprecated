import React from 'react'

import { FileUploader } from './FileUploader'
import { addTileset } from '../indexedDB/tileset'

export interface Props {
  refreshTilesets: () => void
}

async function readImage(file: File) {
  return new Promise<string | ArrayBuffer | null | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result)
    }
    reader.readAsDataURL(file)
  })
}

export function TilesetUploader({ refreshTilesets }: Props) {
  return (
    <FileUploader
      label="Upload a tileset"
      onChange={async (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        const blob = await readImage(file)
        addTileset(blob)
        refreshTilesets()
      }}
    />
  )
}
