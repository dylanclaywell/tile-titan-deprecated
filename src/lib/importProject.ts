import { v4 as generateId } from 'uuid'
import JSZip from 'jszip'

import { addTileset, deleteTilesets, TilesetType } from '../indexedDB/tileset'
import { readFile } from './readFile'

export async function importProject(blob: string | ArrayBuffer) {
  const zip = new JSZip()
  const zipFile = await zip.loadAsync(blob)

  const loadedFiles = await Promise.all(
    Object.values(zipFile.files).map(async (f) => {
      const file = await f.async('blob')
      return {
        name: f.name,
        blob: ((await readFile(file)) ?? '').toString(),
      }
    })
  )

  const tilesets: TilesetType[] = []

  for (const file of loadedFiles) {
    if (file.name.match(/^tilesets\/(.+)\.png$/)) {
      const tilesetName = file.name.replace(/^tilesets\/(.+)\.png$/, '$1')
      tilesets.push({
        id: generateId(),
        name: tilesetName,
        blob: file.blob,
      })
    }
  }

  await deleteTilesets()

  for (const tileset of tilesets) {
    await addTileset(tileset.blob, tileset.name, tileset.id)
  }
}
