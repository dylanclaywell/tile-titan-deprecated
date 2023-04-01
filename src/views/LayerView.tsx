import React, { useState } from 'react'

import { Tool } from '../components/Tool'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'
import { RenameLayerModal } from '../components/Layer/RenameLayerModal'
import { LayerType, Type } from '../types/layer'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { ResourceList } from '../components/ResourceList/ResourceList'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  addLayer,
  handleToolClick,
  removeLayer,
  setSelectedLayerId,
  updateLayerSettings,
} from '../features/editor/editorSlice'

function getLayerIcon(layerType: Type) {
  switch (layerType) {
    case 'tile':
      return 'fa-image'
    case 'object':
      return 'fa-object-group'
    case 'structure':
      return 'fa-cubes'
  }
}

export function LayerView() {
  const [draggedLayer, setDraggedLayer] = useState<LayerType | null>(null)
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null)
  const { files, selectedFileId, selectedLayerId } = useAppSelector(
    (state) => ({
      files: state.editor.files,
      selectedFileId: state.editor.selectedFileId,
      selectedLayerId: state.editor.selectedLayerId,
    })
  )
  const dispatch = useAppDispatch()

  const currentFile = [...files].find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )

  const renamingLayer = currentFile?.layers.find(
    (layer) => layer.id === renamingLayerId
  )

  return (
    <div>
      <Tools>
        <ToolSection>
          <Tool
            onClick={() => dispatch(addLayer({ type: 'tile' }))}
            icon="image"
            name="Add tile layer"
            isDisabled={!currentFile}
          />
          <Tool
            onClick={() => dispatch(addLayer({ type: 'object' }))}
            icon="object-group"
            name="Add object layer"
            isDisabled={!currentFile}
          />
          <Tool
            onClick={() => dispatch(addLayer({ type: 'structure' }))}
            icon="cubes"
            name="Add structure layer"
            isDisabled={!currentFile}
          />
        </ToolSection>
      </Tools>
      <h1 className="m-2 mb-0 text-xl text-gray-400">Layers</h1>
      <ResourceList>
        {[...(currentFile?.layers ?? [])]
          .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))
          .map((layer) => (
            <ResourceListItem
              key={`layer-${layer.id}`}
              id={layer.id}
              icon={getLayerIcon(layer.type)}
              sortOrder={layer.sortOrder}
              isSelected={layer.id === selectedLayerId}
              isVisible={layer.isVisible}
              name={layer.name}
              onClick={() => {
                if (layer.type !== currentLayer?.type) {
                  dispatch(handleToolClick({ type: 'select' }))
                }

                dispatch(setSelectedLayerId({ id: layer.id }))
              }}
              onRename={() => setRenamingLayerId(layer.id)}
              onDragStart={() => {
                setDraggedLayer(layer)
              }}
              onDragEnd={() => {
                setDraggedLayer(null)
              }}
              onDrop={(event) => {
                event.preventDefault()

                if (!draggedLayer) return
                if (draggedLayer?.id === layer.id) return

                dispatch(
                  updateLayerSettings({
                    id: draggedLayer.id,
                    layer: {
                      sortOrder: layer.sortOrder,
                    },
                  })
                )
                dispatch(
                  updateLayerSettings({
                    id: layer.id,
                    layer: {
                      sortOrder: draggedLayer.sortOrder,
                    },
                  })
                )
              }}
              onHide={() =>
                dispatch(
                  updateLayerSettings({
                    id: layer.id,
                    layer: { isVisible: !layer.isVisible },
                  })
                )
              }
              onDelete={() => dispatch(removeLayer({ id: layer.id }))}
              draggedId={draggedLayer?.id ?? null}
            />
          ))}
      </ResourceList>
      <RenameLayerModal
        isOpen={Boolean(renamingLayerId)}
        onClose={() => setRenamingLayerId(null)}
        currentLayerName={renamingLayer?.name ?? ''}
        onSubmit={(name) => {
          if (!renamingLayerId) return

          dispatch(
            updateLayerSettings({
              id: renamingLayerId,
              layer: { name },
            })
          )
          setRenamingLayerId(null)
        }}
      />
    </div>
  )
}
