import React from 'react'

import { LayerView } from './LayerView'
import { TilesetView } from './TilesetView'

export function MetadataView() {
  return (
    <div className="overflow-hidden flex flex-col basis-[30vw] divide-y border-gray-600">
      <LayerView />
      <TilesetView />
    </div>
  )
}
