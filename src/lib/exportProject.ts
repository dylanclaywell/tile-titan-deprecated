import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import { FileType } from '../types/file'
import { getTilesets } from '../indexedDB/tileset'

export async function exportProject(files: FileType[]) {
  const zip = new JSZip()

  const tilesetFolders = zip.folder('tilesets')

  if (!tilesetFolders) {
    return
  }

  const tilesets = await getTilesets()

  for (const tileset of tilesets) {
    if (!tileset.blob) {
      continue
    }
    const blob = await (await fetch(tileset.blob)).blob()
    const tilesetFolder = tilesetFolders.folder(tileset.id)

    if (!tilesetFolder) {
      continue
    }

    tilesetFolder.file(`${tileset.name}.png`, blob, {
      base64: true,
    })
  }

  for (const file of files) {
    const modifiedLayers = file.layers.map((layer) => ({
      ...layer,
      data:
        layer.type === 'tile'
          ? layer.data.map((row) =>
              row.map((tile) => ({
                tilesetId: tile.tilesetId,
                // Specifically exclude tileData since it's not needed in the exported file
                tilesetName: tile.tilesetName,
                tilesetX: tile.tilesetX,
                tilesetY: tile.tilesetY,
              }))
            )
          : layer.data,
    }))
    const modifiedFile = {
      ...file,
      layers: modifiedLayers,
    }

    zip.file(`${file.name}.json`, JSON.stringify(modifiedFile, null, 2))
  }

  const zipFile = await zip.generateAsync({ type: 'blob' })

  saveAs(zipFile, 'tilemaps.zip')
}
