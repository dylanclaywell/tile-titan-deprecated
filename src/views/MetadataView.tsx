import React, { useContext, useMemo } from 'react'

import { LayerView } from './LayerView'
import { TilesetView } from './TilesetView'
import { EditorContext } from '../contexts/EditorContext'
import { ObjectView } from './ObjectView'

export function MetadataView() {
  const [{ selectedLayerId, layers }] = useContext(EditorContext)

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId),
    [selectedLayerId]
  )

  return (
    <div className="overflow-hidden flex flex-col basis-[30vw] divide-y border-gray-600">
      <LayerView />
      {selectedLayer?.type === 'tilelayer' ? <TilesetView /> : <ObjectView />}
    </div>
  )
}
