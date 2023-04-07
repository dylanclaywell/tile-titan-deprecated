import { RootState } from '../../store'

export const selectCurrentLayer = (state: RootState) => {
  const currentFile = state.editor.files.find(
    (file) => file.id === state.editor.selectedFileId
  )

  if (!currentFile) return null

  return currentFile.layers.find(
    (layer) => layer.id === state.editor.selectedLayerId
  )
}
