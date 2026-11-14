import type { Photo } from './formats'

// Buffer = a temporary "cart" of finished stories. Kept in the app's private IndexedDB (never
// sent anywhere, not visible in Photos/Files) so it survives iOS killing the app in the
// background. Items expire after BUFFER_TTL and the store is emptied after "Download all".

export const BUFFER_LIMIT = 10
export const BUFFER_TTL = 12 * 60 * 60 * 1000

// What's stored: the design minus the object URL (recreated on load).
export type StoredItem = {
  id: string
  createdAt: number
  photo: Omit<Photo, 'url'> & { file: Blob }
}

const DB = 'chromate'
const STORE = 'buffer'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }).finally(() => db.close()) as Promise<T>
}

// Loads unexpired items (oldest first) and deletes expired ones.
export async function loadBuffer(now = Date.now()): Promise<StoredItem[]> {
  const all = await run<StoredItem[]>('readonly', (s) => s.getAll())
  const expired = all.filter((i) => now - i.createdAt > BUFFER_TTL)
  await Promise.all(expired.map((i) => deleteItem(i.id)))
  return all.filter((i) => now - i.createdAt <= BUFFER_TTL).sort((a, b) => a.createdAt - b.createdAt)
}

export const putItem = (item: StoredItem) => run('readwrite', (s) => s.put(item))
export const deleteItem = (id: string) => run('readwrite', (s) => s.delete(id))
export const clearBuffer = () => run('readwrite', (s) => s.clear())
