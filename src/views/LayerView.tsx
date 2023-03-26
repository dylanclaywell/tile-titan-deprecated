import React, { useContext, useState } from 'react'

import { EditorContext } from '../contexts/EditorContext'
import { Tool } from '../components/Tool'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'
import { RenameLayerModal } from '../components/Layer/RenameLayerModal'
import { LayerType, Type } from '../types/layer'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { ResourceList } from '../components/ResourceList/ResourceList'

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
  const [{ files, selectedLayerId, selectedFileId }, { dispatch }] =
    useContext(EditorContext)

  const currentFile = files.find((file) => file.id === selectedFileId)
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
            onClick={() => dispatch({ type: 'ADD_LAYER', layerType: 'tile' })}
            icon="image"
            name="Add tile layer"
            isDisabled={!currentFile}
          />
          <Tool
            onClick={() => dispatch({ type: 'ADD_LAYER', layerType: 'object' })}
            icon="object-group"
            name="Add object layer"
            isDisabled={!currentFile}
          />
          <Tool
            onClick={() =>
              dispatch({ type: 'ADD_LAYER', layerType: 'structure' })
            }
            icon="cubes"
            name="Add structure layer"
            isDisabled={!currentFile}
          />
        </ToolSection>
      </Tools>
      <h1 className="m-2 mb-0 text-xl text-gray-400">Layers</h1>
      <ResourceList>
        {currentFile?.layers
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
                  dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'select' })
                }

                dispatch({ type: 'SET_SELECTED_LAYER_ID', id: layer.id })
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

                dispatch({
                  type: 'UPDATE_LAYER_SETTINGS',
                  id: draggedLayer.id,
                  layer: {
                    sortOrder: layer.sortOrder,
                  },
                })
                dispatch({
                  type: 'UPDATE_LAYER_SETTINGS',
                  id: layer.id,
                  layer: {
                    sortOrder: draggedLayer.sortOrder,
                  },
                })
              }}
              onHide={() =>
                dispatch({
                  type: 'UPDATE_LAYER_SETTINGS',
                  id: layer.id,
                  layer: { isVisible: !layer.isVisible },
                })
              }
              onDelete={() => dispatch({ type: 'REMOVE_LAYER', id: layer.id })}
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

          dispatch({
            type: 'UPDATE_LAYER_SETTINGS',
            id: renamingLayerId,
            layer: { name },
          })
          setRenamingLayerId(null)
        }}
      />
    </div>
  )
}
