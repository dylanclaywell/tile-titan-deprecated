import z from 'zod'
import JSZip from 'jszip'

import { deleteTilesets, TilesetType } from '../indexedDB/tileset'
import { readFile } from './readFile'
import { File, FileType } from '../types/file'

type ImageFile = {
  name: string
  blob: string
}

type TilemapFile = {
  name: string
  data: FileType
}

type TilesetFile = {
  name: string
  data: TilesetType
}

type LoadedFile = ImageFile | TilemapFile | TilesetFile

function isImageName(fileName: string) {
  return /(.+)\.png$/.test(fileName)
}

function isImageFile(file: LoadedFile): file is ImageFile {
  return isImageName(file.name)
}

function isTilesetName(fileName: string) {
  return /(.+)\/metadata\.json$/.test(fileName)
}

function isTilesetDirectory(file: LoadedFile): file is ImageFile | TilesetFile {
  return /^.+\/(.+)\/(.+)\./.test(file.name)
}

async function parseFile(
  rawFile: JSZip.JSZipObject
): Promise<LoadedFile | undefined> {
  const file = await rawFile.async('blob')

  if (/__MACOSX|\.DS_Store/.test(rawFile.name)) {
    return
  }

  if (isImageName(rawFile.name)) {
    return {
      name: rawFile.name,
      blob: ((await readFile(file, 'dataURL')) ?? '').toString(),
    }
  }

  const fileText = await readFile(file, 'text')

  if (!fileText) {
    return
  }

  return {
    name: rawFile.name,
    data: isTilesetName(rawFile.name)
      ? z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .parse(JSON.parse(fileText.toString()))
      : File.parse(JSON.parse(fileText.toString())),
  }
}

export async function importProject(blob: string | ArrayBuffer): Promise<{
  tilesets: TilesetType[]
  files: FileType[]
}> {
  const zip = new JSZip()
  const zipFile = await zip.loadAsync(blob)

  const loadedFiles: LoadedFile[] = (
    await Promise.all(Object.values(zipFile.files).map(parseFile))
  ).filter((f): f is LoadedFile => Boolean(f))

  const tilesets: {
    [name: string]: TilesetFile
  } = {}
  const unmodifedFiles: FileType[] = []
  const images: { id: string; image: HTMLImageElement }[] = []

  for (const file of loadedFiles) {
    if (isTilesetDirectory(file)) {
      const tilesetName = file.name.replace(/^.+\/(.+)\/.+$/, '$1')
      const existingData = tilesets[tilesetName]?.data
      tilesets[tilesetName] = {
        data: {
          ...(existingData ?? {}),
          ...(isImageFile(file) ? { blob: file.blob } : file.data),
        },
        name: tilesetName,
      }
    } else {
      unmodifedFiles.push(file.data)
    }
  }

  await deleteTilesets()

  for (const tileset of Object.values(tilesets)) {
    const image = new Image()
    image.src = tileset.data.blob ?? ''
    images.push({
      id: tileset.data.id,
      image,
    })
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.image.onload = () => {
            resolve()
          }

          if (image.image.complete && image.image.naturalHeight !== 0) {
            resolve()
          }
        })
    )
  )

  const imageCanvases = images.map((image) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.image.width
    canvas.height = image.image.height
    const context = canvas.getContext('2d')
    context?.drawImage(image.image, 0, 0)
    return {
      id: image.id,
      canvas,
    }
  })

  const tiles: {
    id: string
    tilesetX: number
    tilesetY: number
    tileData: string
  }[] = []

  const files: FileType[] = []

  for (const file of unmodifedFiles) {
    const newFile = file
    const layers = newFile.layers.map((layer) => {
      if (layer.type === 'tile') {
        return {
          ...layer,
          data: layer.data.map((row) => {
            return row.map((column) => {
              const image = imageCanvases.find((i) => i.id === column.tilesetId)

              if (!image) return column

              const existingTile = tiles.find(
                (t) =>
                  t.id === column.tilesetId &&
                  t.tilesetX === column.tilesetX &&
                  t.tilesetY === column.tilesetY
              )

              if (existingTile) {
                return {
                  ...column,
                  tileData: existingTile?.tileData,
                }
              }

              const context = image?.canvas.getContext('2d')
              const tile = context?.getImageData(
                column.tilesetX * newFile.tileWidth,
                column.tilesetY * newFile.tileHeight,
                newFile.tileWidth,
                newFile.tileHeight
              )

              const tileCanvas = document.createElement('canvas')
              tileCanvas.width = newFile.tileWidth
              tileCanvas.height = newFile.tileHeight
              const tileContext = tileCanvas.getContext('2d')
              tileContext?.putImageData(tile ?? new ImageData(0, 0), 0, 0)

              const tileData = tileCanvas.toDataURL()

              tiles.push({
                id: column.tilesetId,
                tilesetX: column.tilesetX,
                tilesetY: column.tilesetY,
                tileData,
              })

              return {
                ...column,
                tileData,
              }
            })
          }),
        }
      }

      return layer
    })

    files.push({
      ...newFile,
      layers,
    })
  }

  return { files, tilesets: Object.values(tilesets).map((t) => t.data) }
}
