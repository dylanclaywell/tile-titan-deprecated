import React from 'react'

import TilesetViewer from './components/TilesetViewer'
import { TilemapEditorView } from './components/TilemapEditorView'
import { ToolProvider } from './contexts/ToolContext'

function App() {
  return (
    <ToolProvider>
      <TilemapEditorView />
      <TilesetViewer />
    </ToolProvider>
  )
}

export default App
