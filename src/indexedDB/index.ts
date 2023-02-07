export type ObjectStoreName = 'tilesets'

export function openDatabase(objectStoreName: ObjectStoreName) {
  const request = indexedDB.open('tilemap-editor', 1)

  request.onupgradeneeded = (event) => {
    const database = (event.target as any)?.result
    database.createObjectStore(objectStoreName, { keyPath: 'id' })
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onsuccess = (event) => {
      const database = (event.target as any)?.result
      resolve(database)
    }

    request.onerror = (event) => {
      reject(event)
    }
  })
}
