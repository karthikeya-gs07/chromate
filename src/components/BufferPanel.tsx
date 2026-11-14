import { useEffect, useRef, useState } from 'react'
import useApp from '../hooks/useApp'
import GlassButton from './GlassButton'
import TemplateView from './TemplateView'
import { CloseIcon, TrashIcon } from './icons'
import downloadIcon from '../assets/download.svg'
import { BUFFER_LIMIT } from '../lib/bufferStore'
import { templateOf } from '../lib/templates'
import { exportAll } from '../lib/exportImages'

type Props = {
  // Re-open a buffered story in the editor.
  onOpenItem: (id: string) => void
}

// The buffer ("cart") as a side panel sliding in from the right, under the buffer button. Available on every screen.
export default function BufferPanel({ onOpenItem }: Props) {
  const { buffer, removeFromBuffer, emptyBuffer, panelOpen, setPanelOpen, showToast } = useApp()
  const [busy, setBusy] = useState(false)
  const empty = buffer.length === 0
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus the panel when it opens; Escape closes it.
  useEffect(() => {
    if (!panelOpen) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanelOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, setPanelOpen])

  async function downloadAll() {
    setBusy(true)
    try {
      const count = buffer.length
      const done = await exportAll(
        buffer.map((i) => i.photo),
        'story',
      )
      if (!done) return
      await emptyBuffer()
      setPanelOpen(false)
      showToast(`Downloaded ${count} ${count === 1 ? 'story' : 'stories'}`)
    } catch {
      showToast("Couldn't download. Try again.")
    } finally {
      setBusy(false)
    }
  }

  async function clearAll() {
    const n = buffer.length
    const what = n === 1 ? 'the story' : `all ${n} stories`
    if (!window.confirm(`Delete ${what} in the buffer? This can't be undone.`)) return
    await emptyBuffer()
    showToast('Buffer emptied')
  }

  return (
    <div className={`fixed inset-0 z-40 ${panelOpen ? '' : 'pointer-events-none'}`} inert={!panelOpen}>
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close buffer"
        onClick={() => setPanelOpen(false)}
        className={`absolute inset-0 cursor-default bg-black/60 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Buffer"
        className={`absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col rounded-l-[35px] border-l border-card-border bg-black transition-transform duration-300 ease-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+30px)] pb-4">
          <h2 className="flex items-baseline gap-2 text-xl leading-none text-cream">
            Buffer
            <span className="text-sm text-cream/50 tabular-nums">
              {buffer.length}/{BUFFER_LIMIT}
            </span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label="Close buffer"
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full"
          >
            <CloseIcon size={14} strokeWidth={1.2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-6">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-lg text-cream">Your buffer is empty</p>
              <p className="text-sm text-sand">Finish a story and tap Add to buffer. Download everything here in one go.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-5">
              {buffer.map((item, i) => (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setPanelOpen(false)
                      onOpenItem(item.id)
                    }}
                    aria-label={`Edit story ${i + 1}`}
                    className="block w-full cursor-pointer overflow-hidden rounded-[10px] transition-transform duration-150 active:scale-[0.97]"
                  >
                    <TemplateView template={templateOf(item.photo)} photo={item.photo} label={`Story ${i + 1}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromBuffer(item.id)}
                    aria-label={`Delete story ${i + 1}`}
                    className="absolute -top-[13px] -right-[13px] flex size-11 cursor-pointer items-center justify-center"
                  >
                    <span className="flex size-[26px] items-center justify-center rounded-full border border-card-border bg-black/80 backdrop-blur-[5.2px] transition-transform active:scale-90">
                      <CloseIcon />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2.5 px-[13px] pt-2 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)]">
          <GlassButton
            onClick={downloadAll}
            disabled={busy || empty}
            className="flex h-16 items-center justify-center gap-[7px]"
          >
            <img src={downloadIcon} alt="" width={27} height={24} />
            <span className="text-lg leading-none text-cream">{busy ? 'Preparing…' : 'Download all'}</span>
          </GlassButton>
          <GlassButton
            onClick={clearAll}
            disabled={busy || empty}
            aria-label="Empty buffer"
            className="flex h-16 items-center justify-center gap-2 px-5"
          >
            <TrashIcon />
            <span className="text-lg leading-none text-cream">Empty</span>
          </GlassButton>
        </div>
      </aside>
    </div>
  )
}
