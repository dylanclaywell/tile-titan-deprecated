import { v4 as generateId } from 'uuid'
import z from 'zod'

import { openDatabase } from './index'
import { IDBEvent } from './utils'

const Tileset = z.object({
  id: z.string(),
  name: z.string(),
  blob: z.union([z.string(), z.undefined()]),
})

export type TilesetType = z.infer<typeof Tileset>

export async function getTilesets() {
  const database = await openDatabase('tilesets', 'id')

  const tilesets = database
    .transaction('tilesets', 'readonly')
    .objectStore('tilesets')

  return new Promise<TilesetType[]>((resolve, reject) => {
    const request = tilesets.getAll()

    request.onsuccess = (event) => {
      const result = Tileset.array().parse(IDBEvent.parse(event.target)?.result)
      resolve(result)
    }

    request.onerror = (event) => {
      reject(event)
    }
  })
}

export async function addTileset(
  blob: string | ArrayBuffer | null | undefined,
  name?: string,
  id?: string
) {
  const database = await openDatabase('tilesets', 'id')

  const newTileset = Tileset.parse({
    name: name ?? 'New Tileset',
    blob,
    id: id ?? generateId(),
  })

  const tileset = database
    .transaction('tilesets', 'readwrite')
    .objectStore('tilesets')
  tileset.add(newTileset)
}

export async function changeTilesetName(id: string, name: string) {
  const database = await openDatabase('tilesets', 'id')

  const tileset = database
    .transaction('tilesets', 'readwrite')
    .objectStore('tilesets')
  tileset.get(id).onsuccess = (event) => {
    const existingTileset = Tileset.parse(IDBEvent.parse(event.target)?.result)
    existingTileset.name = name
    tileset.put(existingTileset)
  }
}

export async function deleteTilesets() {
  const database = await openDatabase('tilesets', 'id')

  const tilesets = database
    .transaction('tilesets', 'readwrite')
    .objectStore('tilesets')
  tilesets.clear()
}
