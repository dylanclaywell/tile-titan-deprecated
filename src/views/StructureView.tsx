import React, { useContext } from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { EditorContext } from '../contexts/EditorContext'
import { FileType } from '../types/file'

export function StructureView() {
  const [{ files, selectedFileId }] = useContext(EditorContext)

  const availableStructures: FileType[] = files.filter(
    (f) => f.id !== selectedFileId && f.isStructure
  )

  return (
    <div className="flex flex-col basis-[30vw] border-gray-600 flex-grow">
      <div className="basis-1/2 flex-1 overflow-y-auto">
        <h1 className="m-2 mb-0 text-xl text-gray-400">Structures</h1>
        <ResourceList>
          {availableStructures.map((structure) => {
            if (!structure) return null

            return (
              <ResourceListItem
                key={`object-${structure.id}`}
                id={structure.id}
                sortOrder={structure.sortOrder}
                isSelected={false}
                isVisible
                name={structure.name}
                onClick={() => {
                  // TODO
                }}
                onDragStart={() => {
                  // TODO
                }}
                onDragEnd={() => {
                  // TODO
                }}
                onDrop={(event) => {
                  event.preventDefault()
                }}
                draggedId={null}
              />
            )
          })}
        </ResourceList>
      </div>
    </div>
  )
}
