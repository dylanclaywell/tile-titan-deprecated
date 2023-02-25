import React from 'react'

import { TilemapEditorView } from './views/TilemapEditorView'
import { EditorProvider } from './contexts/EditorContext'
import { MetadataView } from './views/MetadataView'

function App() {
  return (
    <EditorProvider>
      <TilemapEditorView />
      <MetadataView />
    </EditorProvider>
  )
}

export default App
