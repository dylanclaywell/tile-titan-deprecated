import { FileType } from '../types/file'

export function convertFileToImageData(file: FileType) {
  // TODO this should use indexedDB to cache the images to improve performance

  const canvas = document.createElement('canvas')
  canvas.width = file.width * file.tileWidth
  canvas.height = file.height * file.tileHeight

  const context = canvas.getContext('2d')

  for (const layer of file.layers) {
    if (layer.type === 'tile') {
      for (let y = 0; y < layer.data.length; y++) {
        const row = layer.data[y]
        for (let x = 0; x < row.length; x++) {
          const tile = row[x]

          if (tile.tileData) {
            const image = new Image()
            image.src = tile.tileData
            context?.drawImage(image, x * file.tileWidth, y * file.tileHeight)
          }
        }
      }
    }
  }

  return canvas.toDataURL()
}
