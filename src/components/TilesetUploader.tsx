import React from 'react'

import { FileUploader } from './FileUploader'
import { addTileset } from '../indexedDB/tileset'

export interface Props {
  refreshTilesets: () => void
  label: string | React.ReactNode
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

export function TilesetUploader({ refreshTilesets, label }: Props) {
  return (
    <FileUploader
      label={label}
      name="New tileset"
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
