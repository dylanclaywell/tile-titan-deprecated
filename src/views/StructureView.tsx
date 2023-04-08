import React, { useContext } from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { FileType } from '../types/file'
import { convertFileToImageData } from '../utils/convertFileToImageData'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { CursorContext } from '../contexts/CursorContext'
import {
  changeToolType,
  setCursorMetadata,
  setCursorSize,
  setCursorSrc,
} from '../features/cursor/cursorSlice'

export function StructureView() {
  const [cursorRef] = useContext(CursorContext)
  const dispatch = useAppDispatch()
  const { files, selectedFileId } = useAppSelector((state) => {
    return {
      files: state.editor.files,
      selectedFileId: state.editor.selectedFileId,
    }
  })

  const [selectedStructureId, setSelectedStructureId] = React.useState<
    string | null
  >(null)

  const availableStructures: FileType[] = files.filter(
    (f) => f.id !== selectedFileId && f.isStructure
  )

  async function updateStructureRefImage(id: string) {
    if (!cursorRef) return

    const imageRef = cursorRef.querySelector('img')
    if (!imageRef) return

    const structure = files.find((f) => f.id === id)
    if (!structure) return

    const src = (await convertFileToImageData(structure)) ?? ''
    imageRef.src = src

    dispatch(changeToolType('add'))
    dispatch(setCursorMetadata({ fileId: structure.id }))
    dispatch(
      setCursorSize({
        width: structure.width * structure.tileWidth,
        height: structure.height * structure.tileHeight,
      })
    )
    dispatch(setCursorSrc(src))
    cursorRef.style.display = 'block'
    cursorRef.dataset.id = structure.id
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
