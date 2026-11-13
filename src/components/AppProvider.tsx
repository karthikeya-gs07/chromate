import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Photo } from '../lib/formats'
import { newId } from '../lib/photos'
import { BUFFER_LIMIT, clearBuffer, deleteItem, loadBuffer, putItem, type StoredItem } from '../lib/bufferStore'
import Toast from './Toast'
import { AppContext, type AppState, type BufferItem } from '../hooks/useApp'

// The buffer keeps its own copy of each photo (new object URL), so editing or deleting
// the original in the editor never breaks a buffer item.
function toItem(stored: StoredItem): BufferItem {
  return { id: stored.id, createdAt: stored.createdAt, photo: { ...stored.photo, url: URL.createObjectURL(stored.photo.file) } }
}

function toStored(id: string, createdAt: number, photo: Photo): StoredItem {
  const { url: _url, ...rest } = photo
  return { id, createdAt, photo: { ...rest, file: photo.file! } }
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [buffer, setBuffer] = useState<BufferItem[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef<number>(undefined)
  const bufferRef = useRef(buffer)
  useEffect(() => {
    bufferRef.current = buffer
  })

  // Restore this session's buffer (e.g. after iOS reloaded the app in the background).
  useEffect(() => {
    loadBuffer()
      .then((items) => setBuffer(items.map(toItem)))
      .catch(() => {
        // Private mode / storage blocked: buffer still works in memory.
      })
  }, [])

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }, [])

  const addToBuffer = useCallback(async (photo: Photo) => {
    if (!photo.file || bufferRef.current.length >= BUFFER_LIMIT) return null
    const stored = toStored(newId(), Date.now(), { ...photo, id: newId() })
    const item = toItem(stored)
    bufferRef.current = [...bufferRef.current, item]
    setBuffer(bufferRef.current)
    await putItem(stored).catch(() => {})
    return item.id
  }, [])

  const updateBufferItem = useCallback(async (id: string, photo: Photo) => {
    const old = bufferRef.current.find((i) => i.id === id)
    if (!old || !photo.file) return
    const stored = toStored(id, old.createdAt, { ...photo, id: old.photo.id })
    const item = toItem(stored)
    URL.revokeObjectURL(old.photo.url)
    bufferRef.current = bufferRef.current.map((i) => (i.id === id ? item : i))
    setBuffer(bufferRef.current)
    await putItem(stored).catch(() => {})
  }, [])

  const removeFromBuffer = useCallback(async (id: string) => {
    const old = bufferRef.current.find((i) => i.id === id)
    if (old) URL.revokeObjectURL(old.photo.url)
    bufferRef.current = bufferRef.current.filter((i) => i.id !== id)
    setBuffer(bufferRef.current)
    await deleteItem(id).catch(() => {})
  }, [])

  const emptyBuffer = useCallback(async () => {
    bufferRef.current.forEach((i) => URL.revokeObjectURL(i.photo.url))
    bufferRef.current = []
    setBuffer([])
    await clearBuffer().catch(() => {})
  }, [])

  const value = useMemo<AppState>(
    () => ({
      buffer,
      bufferFull: buffer.length >= BUFFER_LIMIT,
      addToBuffer,
      updateBufferItem,
      removeFromBuffer,
      emptyBuffer,
      panelOpen,
      setPanelOpen,
      showToast,
    }),
    [buffer, addToBuffer, updateBufferItem, removeFromBuffer, emptyBuffer, panelOpen, showToast],
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast message={toast.message} visible={toast.visible} />
    </AppContext.Provider>
  )
}
