import React, { useContext } from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { EditorContext } from '../contexts/EditorContext'
import { FileType } from '../types/file'
import { convertFileToImageData } from '../utils/convertFileToImageData'

export function StructureView() {
  const [{ files, selectedFileId, cursorRef }, { dispatch }] =
    useContext(EditorContext)
  const [selectedStructureId, setSelectedStructureId] = React.useState<
    string | null
  >(null)

  const availableStructures: FileType[] = files.filter(
    (f) => f.id !== selectedFileId && f.isStructure
  )

  function updateStructureRefImage(id: string) {
    if (!cursorRef.current) return

    const imageRef = cursorRef.current.querySelector('img')
    if (!imageRef) return

    const structure = files.find((f) => f.id === id)
    if (!structure) return

    imageRef.src = convertFileToImageData(structure)

    dispatch({
      type: 'UPDATE_CANVAS',
      src: convertFileToImageData(structure),
      fileId: structure.id,
      width: structure.width * structure.tileWidth,
      height: structure.height * structure.tileHeight,
      toolType: 'structure',
    })
    cursorRef.current.style.display = 'block'
    cursorRef.current.dataset.id = structure.id
  }

  function onStructureClick(id: string) {
    setSelectedStructureId(id)
    updateStructureRefImage(id)
  }

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
                isSelected={selectedStructureId === structure.id}
                isVisible
                name={structure.name}
                onClick={() => {
                  onStructureClick(structure.id)
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
