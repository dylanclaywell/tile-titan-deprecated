import React from 'react'
import { Provider } from 'react-redux'

import { TilemapEditorView } from './views/TilemapEditorView'
import { FileView } from './views/FileView'
import { MetadataView } from './views/MetadataView'
import { Toolbar } from './components/Toolbar'
import { store } from './store'
import { CursorProvider } from './contexts/CursorContext'

function App() {
  return (
    <Provider store={store}>
      <CursorProvider>
        <div className="w-full flex flex-col">
          <Toolbar />
          <div className="flex max-h-screen max-w-screen divide-x overflow-hidden">
            <FileView />
            <TilemapEditorView />
            <MetadataView />
          </div>
        </div>
      </CursorProvider>
    </Provider>
  )
}

export default App
