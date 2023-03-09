import React, { useContext } from 'react'

import { EditorContext } from '../contexts/EditorContext'
import { ResourceList } from '../components/ResourceList/ResourceList'
import { ResourceListItem } from '../components/ResourceList/ResourceListItem'

export function FileView() {
  const [{ files, selectedFileId }, { selectFile }] = useContext(EditorContext)

  return (
    <div className="p-2 basis-[20vw] border-black">
      <h1 className="text-gray-400 text-xl">Files</h1>
      <ResourceList>
        {files.map((file) => (
          <ResourceListItem
            key={file.id}
            id={file.id}
            draggedId={null}
            name={file.name}
            onClick={() => selectFile(file.id)}
            onDragStart={() => undefined}
            onDragEnd={() => undefined}
            onDrop={() => undefined}
            isSelected={selectedFileId === file.id}
            onDelete={() => undefined}
            onRename={() => undefined}
            sortOrder={0}
          />
        ))}
      </ResourceList>
    </div>
  )
}
