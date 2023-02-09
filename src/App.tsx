import React from 'react'

import { TilesetView } from './components/TilesetView'
import { TilemapEditorView } from './components/TilemapEditorView'
import { ToolProvider } from './contexts/ToolContext'

function App() {
  return (
    <ToolProvider>
      <TilemapEditorView />
      <TilesetView />
    </ToolProvider>
  )
}

export default App
