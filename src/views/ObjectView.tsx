import React, { useState } from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { ObjectType } from '../types/object'
import { Properties } from '../components/Object/Properties'
import {
  removeObject,
  updateObjectSettings,
} from '../features/editor/editorSlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'

export function ObjectView() {
  const dispatch = useAppDispatch()
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const { selectedLayerId, selectedFileId, files } = useAppSelector((state) => {
    return {
      selectedLayerId: state.editor.selectedLayerId,
      selectedFileId: state.editor.selectedFileId,
      files: state.editor.files,
    }
  })

  const [draggedObject, setDraggedObject] = useState<ObjectType | null>(null)
  const [renamingObjectId, setRenamingObjectId] = useState<string | null>(null)

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )

  if (!currentLayer || currentLayer.type !== 'object') return null

  const selectedObject = currentLayer.data.find(
    (object) => object.id === selectedObjectId
  )

  const objects = currentLayer.data

  return (
    <div className="flex flex-col border-gray-600 flex-grow overflow-hidden">
      <div className="basis-1/2 flex-1 overflow-y-auto">
        <h1 className="m-2 mb-0 text-xl text-gray-400">Objects</h1>
        <ResourceList>
          {[...objects]
            .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
            .map((object) => (
              <ResourceListItem
                key={`object-${object.id}`}
                id={object.id}
                sortOrder={object.sortOrder}
                isSelected={object.id === selectedObjectId}
                isVisible={object.isVisible}
                name={object.name}
                onClick={() => {
                  setSelectedObjectId(object.id)
                }}
                onRename={() => setRenamingObjectId(object.id)}
                onDragStart={() => {
                  setDraggedObject(object)
                }}
                onDragEnd={() => {
                  setDraggedObject(null)
                }}
                onDrop={(event) => {
                  event.preventDefault()

                  if (!draggedObject) return
                  if (draggedObject?.id === object.id) return

                  dispatch(
                    updateObjectSettings({
                      layerId: currentLayer.id,
                      objectId: draggedObject.id,
                      object: {
                        sortOrder: object.sortOrder,
                      },
                    })
                  )
                  dispatch(
                    updateObjectSettings({
                      layerId: currentLayer.id,
                      objectId: object.id,
                      object: {
                        sortOrder: draggedObject.sortOrder,
                      },
                    })
                  )
                }}
                onHide={() =>
                  dispatch(
                    updateObjectSettings({
                      layerId: currentLayer.id,
                      objectId: object.id,
                      object: {
                        isVisible: !object.isVisible,
                      },
                    })
                  )
                }
                onDelete={() =>
                  dispatch(
                    removeObject({
                      layerId: currentLayer.id,
                      objectId: object.id,
                    })
                  )
                }
                draggedId={draggedObject?.id ?? null}
              />
            ))}
        </ResourceList>
      </div>
      {selectedObject && <Properties object={selectedObject} />}
    </div>
  )
}
