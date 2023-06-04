import React from 'react'

import { Tools } from '../Tools/Tools'
import { ToolSection } from '../Tools/ToolSection'
import { Tool } from '../Tool'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { changeToolType } from '../../features/cursor/cursorSlice'

export function Toolbar() {
  const toolType = useAppSelector((state) => state.cursor.toolType)
  const { files, selectedFileId, selectedLayerId, showGrid } = useAppSelector(
    (state) => ({
      files: state.editor.files,
      selectedFileId: state.editor.selectedFileId,
      selectedLayerId: state.editor.selectedLayerId,
      showGrid: state.editor.showGrid,
    })
  )
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
              name="Add Tile"
              onClick={() => dispatch(changeToolType({ toolType: 'add' }))}
              isSelected={toolType === 'add'}
              icon="image"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() =>
                dispatch(
                  changeToolType({
                    toolType: 'remove',
                    layerType,
                    tileWidth: currentFile.tileWidth,
                    tileHeight: currentFile.tileHeight,
                  })
                )
              }
              isSelected={toolType === 'remove'}
              icon="eraser"
              isDisabled={!currentLayer}
            />
          </>
        )
      case 'object':
        return (
          <>
            <Tool
              name="Add Object"
              onClick={() => dispatch(changeToolType({ toolType: 'add' }))}
              isSelected={toolType === 'add'}
              icon="vector-square"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() => dispatch(changeToolType({ toolType: 'remove' }))}
              isSelected={toolType === 'remove'}
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
              onClick={() => dispatch(changeToolType({ toolType: 'select' }))}
              isSelected={toolType === 'select'}
              icon="arrow-pointer"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Add Structure"
              onClick={() => dispatch(changeToolType({ toolType: 'add' }))}
              isSelected={toolType === 'add'}
              icon="cubes"
              isDisabled={!currentLayer}
            />
            <Tool
              name="Erase"
              onClick={() => dispatch(changeToolType({ toolType: 'remove' }))}
              isSelected={toolType === 'remove'}
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
