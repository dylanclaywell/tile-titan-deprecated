import React from 'react'

import { TilemapEditorView } from './views/TilemapEditorView'
import { EditorProvider } from './contexts/EditorContext'
import { MetadataView } from './views/MetadataView'
import { Tools } from './components/Tools/Tools'
import { ToolSection } from './components/Tools/ToolSection'
import { Tool } from './components/Tool'

function App() {
  return (
    <EditorProvider>
      <div className="w-full flex flex-col">
        <Tools classes="grow shrink-0 border-black">
          <ToolSection>
            <Tool
              name="New File"
              icon="file-circle-plus"
              onClick={() => undefined}
            />
          </ToolSection>
        </Tools>
        <div className="flex max-h-screen max-w-screen divide-x overflow-hidden">
          <TilemapEditorView />
          <MetadataView />
        </div>
      </div>
    </EditorProvider>
  )
}

export default App
