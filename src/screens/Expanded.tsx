import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import PlusGrid from '../components/PlusGrid'
import TemplateView from '../components/TemplateView'
import BufferButton from '../components/BufferButton'
import { glassSurface } from '../components/GlassButton'
import backIcon from '../assets/back.svg'
import { type Photo, type TextLayout } from '../lib/formats'
import { templateOf } from '../lib/templates'

type Props = {
  photo: Photo
  label: string
  onBack: () => void
  onChange: (patch: Partial<Photo>) => void
  // Pick or replace the image. Shows "Tap to add a photo" when empty and a replace button when set.
  onPickPhoto?: () => void
  // Extra actions under the single/double toggle (e.g. Download / Add to buffer).
  actions?: ReactNode
}

const LAYOUTS: TextLayout[] = ['single', 'double']

function blurText() {
  const el = document.activeElement
  if (el instanceof HTMLTextAreaElement) el.blur()
}

// Figma: Expanded view (node 1:5852). Full-screen editor for one story.
//
// Typing zoom: instead of animating a CSS transform (which fights iOS's own keyboard scrolling),
// the stage becomes a vertical scroller and the template is simply laid out larger, so the text
// slot spans the screen width. The user can slide up/down natively; the photo is locked meanwhile.
export default function Expanded({ photo, label, onBack, onChange, onPickPhoto, actions }: Props) {
  const template = templateOf(photo)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const editing = editingSlot !== null
  const slot = editing ? template.slots[photo.layout][editingSlot] : null

  useLayoutEffect(() => {
    const el = stageRef.current!
    const ro = new ResizeObserver(([entry]) => setStage({ width: entry.contentRect.width, height: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Normal: fit inside the stage. Editing: slot fills the screen width minus 16px each side.
  const fitWidth = Math.floor(Math.min(stage.width, (stage.height * template.width) / template.height))
  const zoomScale = slot ? (window.innerWidth - 32) / slot.w : 0
  const previewWidth = slot ? template.width * zoomScale : fitWidth
  const previewLeft = slot ? window.innerWidth / 2 - (slot.x + slot.w / 2) * zoomScale : 0

  // On entering edit mode, scroll so the text line sits in the upper part of the visible area.
  useLayoutEffect(() => {
    if (!slot) return
    const el = stageRef.current!
    const place = () => {
      const visible = window.visualViewport?.height ?? window.innerHeight
      el.scrollTop = slot.y * zoomScale - visible * 0.3
    }
    place()
    // Once more after the keyboard has finished opening.
    const t = window.setTimeout(place, 350)
    return () => window.clearTimeout(t)
  }, [slot, zoomScale])

  // Keyboard dismissed without blur (e.g. Android back button): finish editing.
  useEffect(() => {
    const vv = window.visualViewport
    if (!editing || !vv) return
    let keyboardSeen = false
    const onResize = () => {
      if (vv.height < window.innerHeight * 0.85) keyboardSeen = true
      else if (keyboardSeen) blurText()
    }
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [editing])

  function setText(i: number, text: string) {
    const texts: [string, string] = [...photo.texts]
    texts[i] = text
    onChange({ texts })
  }

  const layoutIndex = LAYOUTS.indexOf(photo.layout)

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-black">
      <PlusGrid className="absolute" />

      <header
        className={`relative z-10 flex items-center justify-between px-[30px] pt-[calc(env(safe-area-inset-top)+26px)] ${editing ? 'hidden' : ''}`}
      >
        <button type="button" onClick={onBack} className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-[15px] p-2.5">
          <img src={backIcon} alt="" width={24} height={24} />
          <span className="text-xl leading-[0.85] text-cream">Back</span>
        </button>
        <BufferButton className="-mr-2.5" />
      </header>

      <div
        ref={stageRef}
        // Tapping (not scrolling) anywhere outside the text finishes typing.
        onClick={(e) => {
          if (editing && !(e.target instanceof HTMLTextAreaElement)) blurText()
        }}
        className={
          editing
            ? 'relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pt-[calc(env(safe-area-inset-top)+16px)]'
            : 'relative flex min-h-0 flex-1 justify-center px-9 pt-[26px] pb-6'
        }
      >
        <div
          className="relative self-start"
          style={{
            width: previewWidth,
            marginLeft: editing ? previewLeft : undefined,
            // Room to scroll the text line up above the keyboard.
            marginBottom: editing ? '60dvh' : undefined,
          }}
        >
          <TemplateView
            template={template}
            photo={photo}
            label={label}
            editable
            editingSlot={editingSlot}
            onCropChange={(crop) => onChange({ crop })}
            onCropReset={() => onChange({ crop: null })}
            onDetailChange={(detail) => onChange({ detail })}
            onPhotoTap={onPickPhoto}
            onTextChange={setText}
            onTextFocus={setEditingSlot}
            onTextBlur={() => setEditingSlot(null)}
          />

          {/* Replace photo: same corner-button pattern as delete on grid tiles */}
          {onPickPhoto && photo.file && !editing && (
            <button
              type="button"
              onClick={onPickPhoto}
              aria-label="Change photo"
              className="absolute -top-[13px] -right-[13px] flex size-11 cursor-pointer items-center justify-center"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-card-border bg-black/80 backdrop-blur-[5.2px] transition-transform active:scale-90">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 12a8 8 0 0 1 13.66-5.66L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.66 5.66L4 15.5M4 20v-4.5h4.5"
                    stroke="#FFF0C1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>

      {editing && (
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={blurText}
          className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-4 z-20 min-h-11 cursor-pointer rounded-full bg-cream px-5 text-base text-black"
        >
          Done
        </button>
      )}

      {/* Single / double toggle, plus any extra actions */}
      <div
        className={`relative flex flex-col gap-2.5 rounded-t-[35px] bg-black px-[13px] pt-2.5 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)] ${editing ? 'hidden' : ''}`}
      >
        <div role="radiogroup" aria-label="Text layout" className={`${glassSurface} relative grid h-[clamp(64px,11.3dvh,96px)] grid-cols-2 px-2 py-1.5`}>
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-2 w-[calc(50%-8px)] rounded-[23px] border border-card-border bg-card-fill shadow-[inset_0_-8px_22px_0_rgb(255_245_214/0.1)] backdrop-blur-[5.2px] transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${layoutIndex * 100}%)` }}
          />
          {LAYOUTS.map((layout) => (
            <button
              key={layout}
              type="button"
              role="radio"
              aria-checked={photo.layout === layout}
              onClick={() => onChange({ layout })}
              className={`relative cursor-pointer text-xl text-cream transition-opacity duration-300 ${photo.layout === layout ? '' : 'opacity-50'}`}
            >
              {layout}
            </button>
          ))}
        </div>
        {actions}
      </div>
    </main>
  )
}
