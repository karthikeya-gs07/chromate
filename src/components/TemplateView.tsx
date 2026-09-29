import { useLayoutEffect, useRef, useState } from 'react'
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
  onTextChange?: (slot: number, text: string) => void
  onTextFocus?: (slot: number) => void
  onTextBlur?: () => void
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
  const slots = template.slots[photo.layout]
  const font = templateFont(template)
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

  const { textStyle } = template
  const slotStyle = (slot: (typeof slots)[number]) => ({
    left: slot.x,
    top: slot.y,
    width: slot.w,
    height: slot.h,
    textAlign: slot.align,
    fontSize: textStyle.fontSize,
    lineHeight: `${textStyle.lineHeight}px`,
    fontWeight: textStyle.fontWeight,
    color: textStyle.color,
  })

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

          {/* Text slots: typed into directly, no separate field */}
          {slots.map((slot, i) => {
            const value = photo.texts[i]
            return editable ? (
              <input
                key={i}
                value={value}
                onChange={(e) => onTextChange?.(i, fitText(value, e.target.value, font, slot.w))}
                onFocus={() => onTextFocus?.(i)}
                onBlur={onTextBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                placeholder={slot.placeholder}
                aria-label={`${slot.placeholder} for ${label}`}
                data-text-slot={i}
                enterKeyHint="done"
                autoComplete="off"
                className="absolute bg-transparent p-0 outline-none placeholder:text-current placeholder:opacity-50"
                style={slotStyle(slot)}
              />
            ) : (
              <span key={i} className="absolute overflow-hidden whitespace-nowrap" style={{ ...slotStyle(slot), opacity: value ? 1 : 0.5 }}>
                {value || slot.placeholder}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
