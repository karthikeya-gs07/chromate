import { useEffect, useRef, useState } from 'react'
import Expanded from './Expanded'
import GlassButton from '../components/GlassButton'
import useApp from '../hooks/useApp'
import { BufferIcon } from '../components/icons'
import downloadIcon from '../assets/download.svg'
import useLeaveWarning from '../hooks/useLeaveWarning'
import type { Photo } from '../lib/formats'
import { readImage } from '../lib/photos'
import { pickImages } from '../lib/pickImages'
import { BUFFER_LIMIT } from '../lib/bufferStore'
import { exportAll } from '../lib/exportImages'

type Props = {
  initial: Photo
  // Set when re-opened from the buffer: "Add to buffer" becomes "Update buffer".
  bufferItemId: string | null
  onBack: () => void
  onDirtyChange: (dirty: boolean) => void
}

// One story in a single-photo template: pick a photo, adjust it, add text,
// then add it to the buffer or download it. Stays open after adding, so the photo can be
// swapped to make another story with the same template.
export default function SingleEditor({ initial, bufferItemId, onBack, onDirtyChange }: Props) {
  const { buffer, bufferFull, addToBuffer, updateBufferItem, showToast } = useApp()
  const [photo, setPhoto] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<'download' | 'buffer' | null>(null)
  // True right after adding, until the next change: avoids adding the same story twice.
  const [justAdded, setJustAdded] = useState(false)
  const unsaved = dirty && photo.file !== null
  useLeaveWarning(unsaved)
  useEffect(() => onDirtyChange(unsaved), [unsaved, onDirtyChange])

  // This screen owns its object URL (buffer items keep their own); free it on replace/unmount.
  const urlRef = useRef(photo.url)
  useEffect(() => {
    urlRef.current = photo.url
  }, [photo.url])
  useEffect(() => () => URL.revokeObjectURL(urlRef.current), [])

  function change(patch: Partial<Photo>) {
    setPhoto((p) => ({ ...p, ...patch }))
    setDirty(true)
    setJustAdded(false)
  }

  async function pickPhoto() {
    const [file] = await pickImages({ multiple: false })
    if (!file) return
    try {
      const img = await readImage(file)
      URL.revokeObjectURL(urlRef.current)
      change({ ...img, crop: null })
    } catch {
      showToast("Couldn't open that photo. Try another one.")
    }
  }

  // An item re-opened from the buffer may have been deleted from the panel meanwhile.
  const editingItem = bufferItemId !== null && buffer.some((i) => i.id === bufferItemId)

  async function saveToBuffer() {
    setBusy('buffer')
    try {
      if (editingItem) {
        await updateBufferItem(bufferItemId!, photo)
        showToast('Buffer updated')
      } else if (bufferFull) {
        showToast(`Buffer is full (${BUFFER_LIMIT}/${BUFFER_LIMIT})`)
        return
      } else {
        // Each add is a new story: change the photo/text and add again to make another.
        const id = await addToBuffer(photo)
        if (!id) return
        setJustAdded(true)
        showToast(`Added to buffer (${buffer.length + 1}/${BUFFER_LIMIT})`)
      }
      setDirty(false)
    } finally {
      setBusy(null)
    }
  }

  async function download() {
    setBusy('download')
    try {
      if (await exportAll([photo], 'story')) {
        setDirty(false)
        showToast('Saved')
      }
    } catch {
      showToast("Couldn't save. Try again.")
    } finally {
      setBusy(null)
    }
  }

  function back() {
    if (unsaved && !window.confirm("This story isn't in the buffer or saved yet. Go back anyway?")) return
    onBack()
  }

  const noPhoto = photo.file === null

  return (
    <Expanded
      format="story"
      photo={photo}
      label="Story"
      onBack={back}
      onChange={change}
      onPickPhoto={pickPhoto}
      actions={
        <div className="grid grid-cols-2 gap-2.5">
          <GlassButton
            onClick={download}
            disabled={noPhoto || busy !== null}
            className="flex h-16 items-center justify-center gap-2"
          >
            <img src={downloadIcon} alt="" width={27} height={24} />
            <span className="text-lg leading-none text-cream">{busy === 'download' ? 'Preparing…' : 'Download'}</span>
          </GlassButton>
          <GlassButton
            onClick={saveToBuffer}
            disabled={noPhoto || busy !== null || (editingItem ? !dirty : justAdded)}
            className="flex h-16 items-center justify-center gap-2"
          >
            <BufferIcon />
            <span className="text-lg leading-none text-cream">
              {editingItem ? (dirty ? 'Update buffer' : 'In buffer') : justAdded ? 'Added' : 'Add to buffer'}
            </span>
          </GlassButton>
        </div>
      }
    />
  )
}
