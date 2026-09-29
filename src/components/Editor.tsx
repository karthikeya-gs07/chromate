import { useEffect, useRef, useState } from 'react'
import Landing from '../screens/Landing'
import PhotoGrid from '../screens/PhotoGrid'
import { MAX_PHOTOS, type Format, type Photo } from '../lib/formats'

// Holds the session's photos (in memory only) and switches between screens.
export default function Editor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFormat, setPendingFormat] = useState<Format>('story')
  const [format, setFormat] = useState<Format | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [dirty, setDirty] = useState(false)

  // Warn before leaving with work that hasn't been downloaded.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function pickPhotos(next: Format) {
    setPendingFormat(next)
    inputRef.current?.click()
  }

  function onFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    // When already on the grid, new photos are appended (up to MAX_PHOTOS in total).
    const room = format ? MAX_PHOTOS - photos.length : MAX_PHOTOS
    const files = Array.from(e.target.files ?? []).slice(0, room)
    e.target.value = ''
    if (files.length === 0) return
    const added = files.map((file) => ({ id: crypto.randomUUID().slice(0, 8), file, url: URL.createObjectURL(file) }))
    setPhotos((prev) => (format ? [...prev, ...added] : added))
    if (!format) setFormat(pendingFormat)
    setDirty(true)
  }

  function goBack() {
    if (dirty && !window.confirm("Your photos haven't been downloaded. Go back anyway?")) return
    photos.forEach((p) => URL.revokeObjectURL(p.url))
    setPhotos([])
    setFormat(null)
    setDirty(false)
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onFilesChosen} />
      {format ? (
        <PhotoGrid format={format} photos={photos} onBack={goBack} onAddMore={() => inputRef.current?.click()} onDownloaded={() => setDirty(false)} />
      ) : (
        <Landing onSelectFormat={pickPhotos} />
      )}
    </>
  )
}
