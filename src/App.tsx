import React from 'react'

import { TilesetView } from './components/TilesetView'
import { TilemapEditorView } from './components/TilemapEditorView'
import { EditorProvider } from './contexts/ToolContext'

function App() {
  return (
    <EditorProvider>
      <TilemapEditorView />
      <TilesetView />
    </EditorProvider>
  )
}

export default App
