import React, { useEffect, useState } from 'react'
import { removeStructure } from '../../features/editor/editorSlice'
import { selectCurrentLayer } from '../../features/editor/selectors'

import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { StructureType } from '../../types/structure'
import { convertFileToImageData } from '../../utils/convertFileToImageData'
import { Structure } from './Structure'

export function RenderedStructure({ structure }: { structure: StructureType }) {
  const [src, setSrc] = useState<string>()
  const dispatch = useAppDispatch()
  const { files } = useAppSelector((state) => ({
    files: state.editor.files,
  }))
  const currentLayer = useAppSelector(selectCurrentLayer)
  const toolType = useAppSelector((state) => state.cursor.toolType)

  const { x, y, fileId } = structure

  useEffect(() => {
    ;(async () => {
      const file = files.find((f) => f.id === fileId)

      if (!file) {
        return
      }

      const src = await convertFileToImageData(file)

      setSrc(src)
    })()
  }, [files, fileId])

  return (
    <Structure
      x={x}
      y={y}
      src={src ?? ''}
      id={structure.id}
      isVisible={currentLayer?.isVisible ?? false}
      onClick={() => {
        if (currentLayer?.type === 'structure' && toolType === 'remove') {
          dispatch(removeStructure({ id: structure.id }))
        }
      }}
    />
  )
}
