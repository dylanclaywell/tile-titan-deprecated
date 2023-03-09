import React from 'react'

import { EditorProvider } from './contexts/EditorContext'
import { TilemapEditorView } from './views/TilemapEditorView'
import { FileView } from './views/FileView'
import { MetadataView } from './views/MetadataView'
import { Toolbar } from './components/Toolbar'

function App() {
  return (
    <EditorProvider>
      <div className="w-full flex flex-col">
        <Toolbar />
        <div className="flex max-h-screen max-w-screen divide-x overflow-hidden">
          <FileView />
          <TilemapEditorView />
          <MetadataView />
        </div>
      </div>
    </EditorProvider>
  )
}

export default App
