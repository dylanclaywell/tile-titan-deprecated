import React from 'react'

import { Tools } from '../Tools/Tools'
import { ToolSection } from '../Tools/ToolSection'
import { Tool } from '../Tool'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { handleToolClick } from '../../features/editor/editorSlice'

export function Toolbar() {
  const { files, selectedFileId, selectedLayerId, tool, showGrid } =
    useAppSelector((state) => ({
      files: state.editor.files,
      selectedFileId: state.editor.selectedFileId,
      selectedLayerId: state.editor.selectedLayerId,
      tool: state.editor.tool,
      showGrid: state.editor.showGrid,
    }))
  const dispatch = useAppDispatch()

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )
  const layerType = currentLayer?.type

  if (!currentFile || !currentLayer) return null

  const tools = (() => {
    switch (layerType) {
      case 'tile':
        return (
          <>
            <Tool
              name="Tile"
              onClick={() => dispatch(handleToolClick({ type: 'tile' }))}
              isSelected={tool.type === 'tile'}
              icon="image"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() => dispatch(handleToolClick({ type: 'eraser' }))}
              isSelected={tool.type === 'eraser'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
      case 'object':
        return (
          <>
            <Tool
              name="Select"
              onClick={() => dispatch(handleToolClick({ type: 'select' }))}
              isSelected={tool.type === 'select'}
              icon="arrow-pointer"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Object"
              onClick={() => dispatch(handleToolClick({ type: 'object' }))}
              isSelected={tool.type === 'object'}
              icon="vector-square"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() => dispatch(handleToolClick({ type: 'eraser' }))}
              isSelected={tool.type === 'eraser'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
      case 'structure':
        return (
          <>
            <Tool
              name="Select"
              onClick={() => dispatch(handleToolClick({ type: 'select' }))}
              isSelected={tool.type === 'select'}
              icon="arrow-pointer"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Structure"
              onClick={() => dispatch(handleToolClick({ type: 'structure' }))}
              isSelected={tool.type === 'structure'}
              icon="cubes"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() => dispatch(handleToolClick({ type: 'eraser' }))}
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
