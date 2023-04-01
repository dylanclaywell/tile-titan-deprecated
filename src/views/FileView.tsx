import React from 'react'

import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'
import { Properties } from '../components/File/Properties'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { deleteFile, selectFile } from '../features/editor/editorSlice'

export function FileView() {
  const { files, selectedFileId } = useAppSelector((state) => ({
    files: state.editor.files,
    selectedFileId: state.editor.selectedFileId,
  }))
  const dispatch = useAppDispatch()

  return (
    <div className="p-2 basis-[20vw] border-black">
      <h1 className="text-gray-400 text-xl">Files</h1>
      <ResourceList>
        {[...files]
          .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
          .map((file) => (
            <ResourceListItem
              key={file.id}
              id={file.id}
              draggedId={null}
              name={file.name}
              onClick={() => dispatch(selectFile({ id: file.id }))}
              onDragStart={() => undefined}
              onDragEnd={() => undefined}
              onDrop={() => undefined}
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
