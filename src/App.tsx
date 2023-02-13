import React from 'react'

import { TilesetView } from './views/TilesetView'
import { TilemapEditorView } from './views/TilemapEditorView'
import { EditorProvider } from './contexts/EditorContext'
import { LayerView } from './views/LayerView'

function App() {
  return (
    <EditorProvider>
      <TilemapEditorView />
      <div className="overflow-hidden flex flex-col basis-[30vw] divide-y">
        <LayerView />
        <TilesetView />
      </div>
    </EditorProvider>
  )
}

export default App
