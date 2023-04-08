import z from 'zod'

import { openDatabase } from './index'

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

  return new Promise<FileImageType>((resolve, reject) => {
    const request = fileImages.get(id)

    request.onsuccess = (event) => {
      try {
        const result = FileImage.parse((event.target as any)?.result)
        resolve(result)
      } catch {
        reject(event)
      }
    }

    request.onerror = (event) => {
      reject(event)
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
  fileImageDB.add(newImage)
}
