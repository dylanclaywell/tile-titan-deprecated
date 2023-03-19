import React, { useContext } from 'react'

import { EditorContext } from '../../contexts/EditorContext'
import { Tools } from '../Tools/Tools'
import { ToolSection } from '../Tools/ToolSection'
import { Tool } from '../Tool'

export function Toolbar() {
  const [
    { files, selectedFileId, selectedLayerId, tool, showGrid },
    { dispatch },
  ] = useContext(EditorContext)

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )
  const layerType = currentLayer?.type

  if (!currentFile || !currentLayer) return null

  const tools = (() => {
    switch (layerType) {
      case 'tilelayer':
        return (
          <>
            <Tool
              name="Tile"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'tile' })
              }
              isSelected={tool.type === 'tile'}
              icon="image"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'eraser' })
              }
              isSelected={tool.type === 'eraser'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
      case 'objectlayer':
        return (
          <>
            <Tool
              name="Select"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'select' })
              }
              isSelected={tool.type === 'select'}
              icon="arrow-pointer"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Object"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'object' })
              }
              isSelected={tool.type === 'object'}
              icon="vector-square"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'eraser' })
              }
              isSelected={tool.type === 'eraser'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
      case 'structurelayer':
        return (
          <>
            <Tool
              name="Select"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'select' })
              }
              isSelected={tool.type === 'select'}
              icon="arrow-pointer"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Structure"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'object' })
              }
              isSelected={tool.type === 'object'}
              icon="cubes"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() =>
                dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'eraser' })
              }
              isSelected={tool.type === 'eraser'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
    }
  })()

  return (
    <Tools>
      <ToolSection>{tools}</ToolSection>
      <ToolSection>
        <Tool
          name="Show Grid"
          onClick={() => dispatch({ type: 'HANDLE_TOOL_CLICK', tool: 'grid' })}
          isSelected={showGrid}
          icon="border-all"
          isDisabled={!currentLayer}
        />
      </ToolSection>
    </Tools>
  )
}
