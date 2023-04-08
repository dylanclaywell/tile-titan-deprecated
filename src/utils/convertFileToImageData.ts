import { addFileImage, getFileImage } from '../indexedDB/fileImages'
import { FileType } from '../types/file'
import { LayerType } from '../types/layer'

async function drawImages(
  context: CanvasRenderingContext2D | null,
  layers: LayerType[],
  tileWidth: number,
  tileHeight: number
) {
  const images: {
    img: HTMLImageElement
    x: number
    y: number
  }[] = []

  const sortedLayers = [...layers].sort((a, b) =>
    a.sortOrder < b.sortOrder ? -1 : 1
  )

  for (const layer of sortedLayers) {
    if (layer.type === 'tile') {
      for (let y = 0; y < layer.data.length; y++) {
        const row = layer.data[y]
        for (let x = 0; x < row.length; x++) {
          const tile = row[x]

          if (tile.tileData) {
            const image = new Image()
            image.src = tile.tileData
            images.push({
              img: image,
              x,
              y,
            })
          }
        }
      }
    }
  }

  await Promise.all(
    images.map(
      (image) => new Promise((resolve) => (image.img.onload = resolve))
    )
  )

  for (const image of images) {
    context?.drawImage(image.img, image.x * tileWidth, image.y * tileHeight)
  }
}

export async function convertFileToImageData(file: FileType) {
  const fileImage = await getFileImage(file.id)

  if (fileImage) {
    return fileImage.blob
  }

  const canvas = document.createElement('canvas')
  canvas.width = file.width * file.tileWidth
  canvas.height = file.height * file.tileHeight

  const context = canvas.getContext('2d')

  await drawImages(context, file.layers, file.tileWidth, file.tileHeight)

  const imageData = canvas.toDataURL()

  await addFileImage(file.id, imageData)

  return imageData
}
