import z from 'zod'

import { openDatabase } from './index'
import { IDBEvent } from './utils'

const FileImage = z.object({
  id: z.string(),
  blob: z.string(),
})

export type FileImageType = z.infer<typeof FileImage>

export async function getFileImage(id: string) {
  const database = await openDatabase('fileImages', 'id')

  const fileImages = database
    .transaction('fileImages', 'readonly')
    .objectStore('fileImages')

  return new Promise<FileImageType | undefined>((resolve) => {
    const request = fileImages.get(id)

    request.onsuccess = (event) => {
      try {
        const result = FileImage.parse(IDBEvent.parse(event.target)?.result)
        resolve(result)
      } catch {
        resolve(undefined)
      }
    }

    request.onerror = () => {
      resolve(undefined)
    }
  })
}

export async function addFileImage(
  id: string,
  blob: string | ArrayBuffer | null | undefined
) {
  const database = await openDatabase('fileImages', 'id')

  const newImage = FileImage.parse({
    id,
    blob,
  })

  const fileImageDB = database
    .transaction('fileImages', 'readwrite')
    .objectStore('fileImages')
  fileImageDB.put(newImage)
}
