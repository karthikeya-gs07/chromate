import { useLayoutEffect, useRef, useState, type Ref } from 'react'
import type { Crop, Photo } from '../lib/formats'
import { templateFont, type Template } from '../lib/templates'
import { clampCrop, coverScale, resolveCrop, zoomAround } from '../lib/crop'
import { fitText } from '../lib/text'

type Props = {
  template: Template
  photo: Photo
  label: string
  // Editable: photo box takes drag/pinch and the text slot is a live input.
  editable?: boolean
  onCropChange?: (crop: Crop) => void
  onTextChange?: (text: string) => void
  onTextFocus?: () => void
  onTextBlur?: () => void
  textInputRef?: Ref<HTMLInputElement>
}

// Renders the template at its real pixel size, scaled down to fit the container width.
export default function TemplateView({
  template,
  photo,
  label,
  editable = false,
  onCropChange,
  onTextChange,
  onTextFocus,
  onTextBlur,
  textInputRef,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const pointers = useRef(new Map<number, { x: number; y: number }>())

  useLayoutEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / template.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [template.width])

  const box = template.photo
  const { text } = template
  const crop = resolveCrop(photo, box)
  const s = coverScale(photo, box) * crop.zoom
  // Latest crop between renders, so fast pointer events don't drop movement.
  const cropRef = useRef(crop)
  cropRef.current = crop

  function update(next: Crop) {
    cropRef.current = next
    onCropChange?.(next)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!editable) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Pointer already gone; ignore.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const pts = pointers.current
    const prev = pts.get(e.pointerId)
    if (!editable || !prev || scale === 0) return
    // On-screen px per template px (includes any zoom applied by a parent).
    const k = e.currentTarget.getBoundingClientRect().width / box.w

    if (pts.size === 1) {
      const c = cropRef.current
      update(clampCrop(photo, box, { ...c, ox: c.ox + (e.clientX - prev.x) / k, oy: c.oy + (e.clientY - prev.y) / k }))
    } else if (pts.size === 2) {
      const other = [...pts.entries()].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = ((e.clientX + other.x) / 2 - rect.left) / k
      const my = ((e.clientY + other.y) / 2 - rect.top) / k
      if (before > 0) update(zoomAround(photo, box, cropRef.current, after / before, mx, my))
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId)
  }

  const textStyle = {
    left: text.x,
    top: text.y,
    width: text.w,
    height: text.h,
    fontSize: text.fontSize,
    lineHeight: `${text.lineHeight}px`,
    fontWeight: text.fontWeight,
    color: text.color,
  }

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
      {scale > 0 && (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: template.width, height: template.height, background: template.background, transform: `scale(${scale})` }}
        >
          {/* Photo box */}
          <div
            className="absolute overflow-hidden bg-[#9e9e9e]"
            style={{ left: box.x, top: box.y, width: box.w, height: box.h, touchAction: editable ? 'none' : 'auto' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              src={photo.url}
              alt={label}
              draggable={false}
              className="absolute top-0 left-0 max-w-none origin-top-left select-none"
              style={{
                width: photo.width,
                height: photo.height,
                transform: `translate(${crop.ox}px, ${crop.oy}px) scale(${s})`,
              }}
            />
          </div>

          {/* Text slot: typed into directly, no separate field */}
          {editable ? (
            <input
              ref={textInputRef}
              value={photo.text}
              onChange={(e) => onTextChange?.(fitText(photo.text, e.target.value, templateFont(template), text.w))}
              onFocus={onTextFocus}
              onBlur={onTextBlur}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder={text.placeholder}
              aria-label={`Text for ${label}`}
              enterKeyHint="done"
              autoComplete="off"
              className="absolute bg-transparent p-0 text-center outline-none placeholder:text-current placeholder:opacity-50"
              style={textStyle}
            />
          ) : (
            <span className="absolute overflow-hidden text-center whitespace-nowrap" style={{ ...textStyle, opacity: photo.text ? 1 : 0.5 }}>
              {photo.text || text.placeholder}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
