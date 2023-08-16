import React, { useMemo } from 'react'

import { LayerView } from './LayerView'
import { TilesetView } from './TilesetView'
import { ObjectView } from './ObjectView'
import { StructureView } from './StructureView'
import { useAppSelector } from '../hooks/redux'

export function MetadataView() {
  const { selectedLayerId, selectedFileId, files } = useAppSelector((state) => {
    return {
      selectedLayerId: state.editor.selectedLayerId,
      selectedFileId: state.editor.selectedFileId,
      files: state.editor.files,
    }
  })

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId),
    [selectedLayerId, selectedFileId]
  )
  const selectedLayer = useMemo(() => {
    return selectedFile?.layers.find((layer) => layer.id === selectedLayerId)
  }, [selectedLayerId, selectedFile])

  const meta = (() => {
    if (!selectedLayer) return

    switch (selectedLayer.type) {
      case 'tile':
        return <TilesetView />
      case 'object':
        return <ObjectView />
      case 'structure':
        return <StructureView />
    }
  })()

  return (
    <div className="overflow-hidden flex flex-col basis-[20vw] divide-y border-gray-300">
      <LayerView />
      {meta}
    </div>
  )
}
