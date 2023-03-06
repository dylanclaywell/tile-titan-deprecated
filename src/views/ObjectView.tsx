import React, { useContext, useState } from 'react'

import { EditorContext } from '../contexts/EditorContext'
import { ObjectLayer } from '../types/layer'
import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { ObjectType } from '../types/object'

export function ObjectView() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [{ selectedLayerId, layers }, { updateObjectSettings, removeObject }] =
    useContext(EditorContext)
  const [draggedObject, setDraggedObject] = useState<ObjectType | null>(null)
  const [renamingObjectId, setRenamingObjectId] = useState<string | null>(null)

  const currentLayer = ObjectLayer.safeParse(
    layers.find((layer) => layer.id === selectedLayerId)
  )

  if (!currentLayer.success) return null

  const objects = currentLayer.data.data

  return (
    <div className="overflow-hidden flex flex-col basis-[30vw] border-gray-600">
      <h1 className="m-2 mb-0 text-xl text-gray-400">Objects</h1>
      <ResourceList>
        {objects
          .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))
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

                updateObjectSettings(currentLayer.data.id, draggedObject.id, {
                  sortOrder: object.sortOrder,
                })
                updateObjectSettings(currentLayer.data.id, object.id, {
                  sortOrder: draggedObject.sortOrder,
                })
              }}
              onHide={() =>
                updateObjectSettings(currentLayer.data.id, object.id, {
                  isVisible: !object.isVisible,
                })
              }
              onDelete={() => removeObject(currentLayer.data.id, object.id)}
              draggedId={draggedObject?.id ?? null}
            />
          ))}
      </ResourceList>
    </div>
  )
}
