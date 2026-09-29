import { useEffect, useRef, useState } from 'react'
import Landing from '../screens/Landing'
import PhotoGrid from '../screens/PhotoGrid'
import Expanded from '../screens/Expanded'
import Toast from './Toast'
import { MAX_PHOTOS, type Format, type Photo } from '../lib/formats'

// Reads a file's pixel size (EXIF orientation applied, same as <img> and createImageBitmap).
async function loadPhoto(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  try {
    await img.decode()
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
  return { id: crypto.randomUUID().slice(0, 8), file, url, width: img.naturalWidth, height: img.naturalHeight, crop: null, texts: ['', ''], layout: 'single' }
}

// Holds the session's photos (in memory only) and switches between screens.
export default function Editor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFormat, setPendingFormat] = useState<Format>('story')
  const [format, setFormat] = useState<Format | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [dirty, setDirty] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef<number>(undefined)

  function showToast(message: string) {
    setToast({ message, visible: true })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  // Warn before leaving with work that hasn't been downloaded.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function pickPhotos(next: Format) {
    // Posts are on hold for the first release.
    if (next === 'post') {
      showToast('Posts are coming soon')
      return
    }
    setPendingFormat(next)
    inputRef.current?.click()
  }

  async function onFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    // When already on the grid, new photos are appended (up to MAX_PHOTOS in total).
    const room = format ? MAX_PHOTOS - photos.length : MAX_PHOTOS
    const files = Array.from(e.target.files ?? []).slice(0, room)
    e.target.value = ''
    if (files.length === 0) return
    const loaded = await Promise.allSettled(files.map(loadPhoto))
    const added = loaded.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    if (added.length === 0) return
    setPhotos((prev) => (format ? [...prev, ...added] : added))
    if (!format) setFormat(pendingFormat)
    setDirty(true)
  }

  function updatePhoto(id: string, patch: Partial<Photo>) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    setDirty(true)
  }

  function deletePhoto(id: string) {
    const photo = photos.find((p) => p.id === id)
    if (photo) URL.revokeObjectURL(photo.url)
    const rest = photos.filter((p) => p.id !== id)
    setPhotos(rest)
    // Nothing left to work on: back to the start.
    if (rest.length === 0) {
      setFormat(null)
      setDirty(false)
    }
  }

  function goBack() {
    if (dirty && !window.confirm("Your photos haven't been downloaded. Go back anyway?")) return
    photos.forEach((p) => URL.revokeObjectURL(p.url))
    setPhotos([])
    setFormat(null)
    setOpenId(null)
    setDirty(false)
  }

  const openPhoto = photos.find((p) => p.id === openId)

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onFilesChosen} />
      {format && openPhoto ? (
        <Expanded
          format={format}
          photo={openPhoto}
          index={photos.indexOf(openPhoto)}
          onBack={() => setOpenId(null)}
          onUpdatePhoto={updatePhoto}
        />
      ) : format ? (
        <PhotoGrid
          format={format}
          photos={photos}
          onBack={goBack}
          onAddMore={() => inputRef.current?.click()}
          onOpenPhoto={setOpenId}
          onDeletePhoto={deletePhoto}
          onDownloaded={() => setDirty(false)}
        />
      ) : (
        <Landing onSelectFormat={pickPhotos} />
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
