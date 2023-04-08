export type Databases = {
  tilesets: 'tilesets'
  fileImages: 'fileImages'
}
export type DatabaseName = 'tilesets' | 'fileImages'

export function openDatabase(databaseName: DatabaseName, keyPath: string) {
  const request = indexedDB.open(databaseName, 1)

  request.onupgradeneeded = (event) => {
    const database = (event.target as any)?.result
    database.createObjectStore(databaseName, { keyPath })
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
