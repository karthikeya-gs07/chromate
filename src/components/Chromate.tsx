import { useCallback, useRef, useState } from 'react'
import AppProvider from './AppProvider'
import useApp from '../hooks/useApp'
import BufferPanel from './BufferPanel'
import Landing from '../screens/Landing'
import Templates from '../screens/Templates'
import BatchFlow from '../screens/BatchFlow'
import SingleEditor from '../screens/SingleEditor'
import type { Format, Photo } from '../lib/formats'
import { emptyPhoto, newId, pickBatchPhotos } from '../lib/photos'
import type { CatalogTemplate } from '../lib/templates'

type Screen =
  | { name: 'landing' }
  | { name: 'templates' }
  | { name: 'batch'; photos: Photo[] }
  // `key` remounts the editor when a different story is opened.
  | { name: 'single'; key: string; photo: Photo; bufferItemId: string | null }

// Story flow: Landing → Templates → (Batch grid | Single editor), with the buffer panel on top.
function Screens() {
  const { buffer, showToast } = useApp()
  const [screen, setScreen] = useState<Screen>({ name: 'landing' })
  // Unsaved work in the open editor, so jumping in from the buffer panel can ask first.
  const dirtyRef = useRef(false)
  const setDirty = useCallback((d: boolean) => {
    dirtyRef.current = d
  }, [])

  function go(next: Screen) {
    dirtyRef.current = false
    setScreen(next)
  }

  function selectFormat(format: Format) {
    // Posts are on hold for the first release.
    if (format === 'post') showToast('Posts are coming soon')
    else go({ name: 'templates' })
  }

  async function selectTemplate(t: CatalogTemplate) {
    if (t.kind === 'single') {
      go({ name: 'single', key: newId(), photo: emptyPhoto(), bufferItemId: null })
      return
    }
    const photos = await pickBatchPhotos()
    if (photos.length > 0) go({ name: 'batch', photos })
  }

  function openBufferItem(id: string) {
    const item = buffer.find((i) => i.id === id)
    if (!item) return
    if (dirtyRef.current && !window.confirm('Leave this story? Changes not added to the buffer will be lost.')) return
    // The editor gets its own object URL, so the buffer thumbnail keeps working.
    const photo = { ...item.photo, url: URL.createObjectURL(item.photo.file!) }
    go({ name: 'single', key: newId(), photo, bufferItemId: id })
  }

  let content
  switch (screen.name) {
    case 'landing':
      content = <Landing onSelectFormat={selectFormat} />
      break
    case 'templates':
      content = <Templates onBack={() => go({ name: 'landing' })} onSelect={selectTemplate} />
      break
    case 'batch':
      content = <BatchFlow initialPhotos={screen.photos} onExit={() => go({ name: 'templates' })} onDirtyChange={setDirty} />
      break
    case 'single':
      content = (
        <SingleEditor
          key={screen.key}
          initial={screen.photo}
          bufferItemId={screen.bufferItemId}
          onBack={() => go({ name: 'templates' })}
          onDirtyChange={setDirty}
        />
      )
      break
  }

  return (
    <>
      {content}
      <BufferPanel onOpenItem={openBufferItem} />
    </>
  )
}

export default function Chromate() {
  return (
    <AppProvider>
      <Screens />
    </AppProvider>
  )
}
