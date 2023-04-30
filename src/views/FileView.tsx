import React, { useState } from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { Properties } from '../components/File/Properties'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  deleteFile,
  selectFile,
  updateFileSortOrder,
} from '../features/editor/editorSlice'
import { setCursorMetadata, setCursorSrc } from '../features/cursor/cursorSlice'
import { FileType } from '../types/file'

export function FileView() {
  const [draggedFile, setDraggedFile] = useState<FileType | null>(null)
  const { files, selectedFileId } = useAppSelector((state) => ({
    files: state.editor.files,
    selectedFileId: state.editor.selectedFileId,
  }))
  const dispatch = useAppDispatch()

  return (
    <div className="p-2 basis-[20vw] border-black overflow-y-auto">
      <h1 className="text-gray-400 text-xl">Files</h1>
      <ResourceList>
        {[...files]
          .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
          .map((file) => (
            <ResourceListItem
              key={file.id}
              id={file.id}
              draggedId={draggedFile?.id || null}
              name={file.name}
              onClick={() => {
                dispatch(selectFile({ id: file.id }))
                dispatch(setCursorSrc(''))
                dispatch(setCursorMetadata(null))
              }}
              onDragStart={() => setDraggedFile(file)}
              onDragEnd={() => setDraggedFile(null)}
              onDrop={(event) => {
                setDraggedFile(null)

                event.preventDefault()

                if (!draggedFile) return
                if (draggedFile?.id === file.id) return

                dispatch(
                  updateFileSortOrder({
                    id: draggedFile.id,
                    sortOrder: file.sortOrder,
                  })
                )
                dispatch(
                  updateFileSortOrder({
                    id: file.id,
                    sortOrder: draggedFile.sortOrder,
                  })
                )
              }}
              isSelected={selectedFileId === file.id}
              onDelete={() => dispatch(deleteFile({ id: file.id }))}
              sortOrder={file.sortOrder}
            />
          ))}
      </ResourceList>
      {selectedFileId && <Properties />}
    </div>
  )
}
