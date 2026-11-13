import { useEffect, useState } from 'react'
import PhotoGrid from './PhotoGrid'
import Expanded from './Expanded'
import useApp from '../hooks/useApp'
import useLeaveWarning from '../hooks/useLeaveWarning'
import { MAX_PHOTOS, type Photo } from '../lib/formats'
import { pickBatchPhotos } from '../lib/photos'
import { BUFFER_LIMIT } from '../lib/bufferStore'

type Props = {
  // Photos chosen on the Templates page when the Batch template was tapped.
  initialPhotos: Photo[]
  onExit: () => void
  onDirtyChange: (dirty: boolean) => void
}

// "Batch" template: the original flow — up to 10 photos in a grid, each openable full screen.
export default function BatchFlow({ initialPhotos, onExit, onDirtyChange }: Props) {
  const { buffer, addToBuffer, showToast } = useApp()
  const [photos, setPhotos] = useState(initialPhotos)
  const [openId, setOpenId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(true)
  useLeaveWarning(dirty)
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  async function addMore() {
    const added = await pickBatchPhotos(MAX_PHOTOS - photos.length)
    if (added.length === 0) return
    setPhotos((prev) => [...prev, ...added])
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
    if (rest.length === 0) {
      setDirty(false)
      onExit()
    }
  }

  function exit() {
    if (dirty && !window.confirm("Your photos haven't been saved. Go back anyway?")) return
    photos.forEach((p) => URL.revokeObjectURL(p.url))
    onExit()
  }

  async function addAllToBuffer() {
    const room = BUFFER_LIMIT - buffer.length
    if (room <= 0) {
      showToast(`Buffer is full (${BUFFER_LIMIT}/${BUFFER_LIMIT})`)
      return
    }
    const toAdd = photos.slice(0, room)
    for (const p of toAdd) await addToBuffer(p)
    if (toAdd.length === photos.length) {
      setDirty(false)
      showToast(`Added ${toAdd.length} to buffer`)
    } else {
      showToast(`Buffer full: added ${toAdd.length} of ${photos.length}`)
    }
  }

  const openPhoto = photos.find((p) => p.id === openId)
  if (openPhoto) {
    return (
      <Expanded
        format="story"
        photo={openPhoto}
        label={`Story ${photos.indexOf(openPhoto) + 1}`}
        onBack={() => setOpenId(null)}
        onChange={(patch) => updatePhoto(openPhoto.id, patch)}
      />
    )
  }

  return (
    <PhotoGrid
      format="story"
      photos={photos}
      onBack={exit}
      onAddMore={addMore}
      onOpenPhoto={setOpenId}
      onDeletePhoto={deletePhoto}
      onAddAllToBuffer={addAllToBuffer}
      onDownloaded={() => setDirty(false)}
    />
  )
}
