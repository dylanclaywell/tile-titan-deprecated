import React, { useEffect } from 'react'

import { TilesetUploader } from './TilesetUploader'
import { TilesetType, getTilesets } from '../indexedDB/tileset'

export default function TilesetViewer() {
  const [tilesets, setTilesets] = React.useState<TilesetType[]>([])

  async function refreshTilesets() {
    setTilesets(await getTilesets())
  }

  useEffect(() => {
    refreshTilesets()
  }, [])

  return (
    <div>
      {tilesets.map((tileset) => (
        <div key={tileset.id}>
          <img src={tileset.blob} alt="tileset" />
        </div>
      ))}
      <TilesetUploader refreshTilesets={refreshTilesets} />
    </div>
  )
}
