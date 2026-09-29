import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import PlusGrid from '../components/PlusGrid'
import TemplateView from '../components/TemplateView'
import { glassSurface } from '../components/GlassButton'
import backIcon from '../assets/back.svg'
import { FORMATS, type Format, type Photo, type TextLayout } from '../lib/formats'
import { TEMPLATES } from '../lib/templates'

type Props = {
  format: Format
  photo: Photo
  index: number
  onBack: () => void
  onUpdatePhoto: (id: string, patch: Partial<Photo>) => void
}

const LAYOUTS: TextLayout[] = ['single', 'double']

// Figma: Expanded view (node 1:5852)
export default function Expanded({ format, photo, index, onBack, onUpdatePhoto }: Props) {
  const template = TEMPLATES[format]
  const stageRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewWidth, setPreviewWidth] = useState(0)
  const [editing, setEditing] = useState(false)
  const [zoom, setZoom] = useState<{ transform: string; origin: string } | null>(null)

  // Fit the template inside the stage (width- or height-limited).
  useLayoutEffect(() => {
    const el = stageRef.current!
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPreviewWidth(Math.floor(Math.min(width, (height * template.width) / template.height)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [template.width, template.height])

  // Zoom so the text slot fills the screen width, placed in the area above the keyboard.
  const computeZoom = useCallback(() => {
    const stage = stageRef.current
    if (!stage || previewWidth === 0) return
    // Untransformed preview position: centered in the stage's content box, top-aligned.
    const rect = stage.getBoundingClientRect()
    const cs = getComputedStyle(stage)
    const padL = parseFloat(cs.paddingLeft)
    const padR = parseFloat(cs.paddingRight)
    const left = rect.left + padL + (rect.width - padL - padR - previewWidth) / 2
    const top = rect.top + parseFloat(cs.paddingTop)

    const s = previewWidth / template.width
    const { text } = template
    const cx = (text.x + text.w / 2) * s
    const cy = (text.y + text.h / 2) * s
    const z = (window.innerWidth - 32) / (text.w * s)
    const vv = window.visualViewport
    const targetY = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight) * 0.4
    setZoom({
      transform: `translate(${window.innerWidth / 2 - (left + cx)}px, ${targetY - (top + cy)}px) scale(${z})`,
      origin: `${cx}px ${cy}px`,
    })
  }, [previewWidth, template])

  useEffect(() => {
    if (!editing) {
      setZoom(null)
      return
    }
    computeZoom()
    const vv = window.visualViewport
    if (!vv) return
    let keyboardSeen = false
    const onResize = () => {
      // Keyboard dismissed without blur (e.g. Android back button): finish editing.
      if (vv.height < window.innerHeight * 0.85) keyboardSeen = true
      else if (keyboardSeen) inputRef.current?.blur()
      computeZoom()
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', computeZoom)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', computeZoom)
    }
  }, [editing, computeZoom])

  const layoutIndex = LAYOUTS.indexOf(photo.layout)
  const title = `${photo.layout === 'single' ? 'Single' : 'Double'} ${FORMATS[format].label}`
  const hideWhileEditing = `transition-opacity duration-300 ${editing ? 'pointer-events-none opacity-0' : ''}`

  return (
    <main
      className="relative flex h-dvh flex-col overflow-hidden bg-black"
      // Tapping anywhere outside the text while typing closes the keyboard.
      onPointerDownCapture={(e) => {
        if (editing && e.target !== inputRef.current) {
          e.preventDefault()
          inputRef.current?.blur()
        }
      }}
    >
      <PlusGrid className="absolute" />

      <header className={`relative z-10 px-[30px] pt-[calc(env(safe-area-inset-top)+36px)] ${hideWhileEditing}`}>
        <button type="button" onClick={onBack} className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-[15px] p-2.5">
          <img src={backIcon} alt="" width={24} height={24} />
          <span className="text-xl leading-[0.85] text-cream">{title}</span>
        </button>
      </header>

      <div ref={stageRef} className="relative flex min-h-0 flex-1 justify-center px-9 pt-9 pb-[37px]">
        <div
          className="relative self-start transition-transform duration-300 ease-out"
          style={{ width: previewWidth, transform: zoom?.transform, transformOrigin: zoom?.origin }}
        >
          <TemplateView
            template={template}
            photo={photo}
            label={`${FORMATS[format].label} ${index + 1}`}
            editable
            onCropChange={(crop) => onUpdatePhoto(photo.id, { crop })}
            onTextChange={(text) => onUpdatePhoto(photo.id, { text })}
            onTextFocus={() => setEditing(true)}
            onTextBlur={() => setEditing(false)}
            textInputRef={inputRef}
          />
        </div>
      </div>

      {/* Single / double toggle */}
      <div className={`relative rounded-t-[35px] bg-black px-[13px] pt-2.5 pb-[calc(max(env(safe-area-inset-bottom),34px)+8px)] ${hideWhileEditing}`}>
        <div role="radiogroup" aria-label="Text layout" className={`${glassSurface} relative grid h-24 grid-cols-2 px-2 py-1.5`}>
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
              onClick={() => onUpdatePhoto(photo.id, { layout })}
              className={`relative cursor-pointer text-xl text-cream transition-opacity duration-300 ${photo.layout === layout ? '' : 'opacity-50'}`}
            >
              {layout}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
