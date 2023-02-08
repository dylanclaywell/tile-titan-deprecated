import React from 'react'

import TilesetViewer from './components/TilesetViewer'
import TilemapEditor from './components/TilemapEditor'
import { ToolProvider } from './contexts/ToolContext'

function App() {
  return (
    <ToolProvider>
      <TilemapEditor />
      <TilesetViewer />
    </ToolProvider>
  )
}

export default App
