import { useLayoutEffect, useRef, useState } from 'react'
import type { Crop, Photo } from '../lib/formats'
import { templateFont, type Template } from '../lib/templates'
import { clampCrop, coverScale, resolveCrop, zoomAround } from '../lib/crop'
import { fitText, wrapLines } from '../lib/text'

type Props = {
  template: Template
  photo: Photo
  label: string
  // Editable: photo box takes drag/pinch and the text slots are live inputs.
  editable?: boolean
  // Slot currently being typed into; while set, the photo is locked.
  editingSlot?: number | null
  onCropChange?: (crop: Crop) => void
  // Double-tap on the photo: back to centered, no zoom.
  onCropReset?: () => void
  // Tap on an empty gray box (no image yet): pick a photo.
  onPhotoTap?: () => void
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
  editingSlot = null,
  onCropChange,
  onCropReset,
  onPhotoTap,
  onTextChange,
  onTextFocus,
  onTextBlur,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  // Tap tracking for double-tap reset: where the current touch started, and the last tap.
  const tapStart = useRef<{ x: number; y: number; multi: boolean } | null>(null)
  const lastTap = useRef({ time: 0, x: 0, y: 0 })
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const empty = photo.file === null
  const photoMovable = editable && editingSlot === null && !empty

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
  useLayoutEffect(() => {
    cropRef.current = crop
  })

  function update(next: Crop) {
    cropRef.current = next
    onCropChange?.(next)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!photoMovable) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Pointer already gone; ignore.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) tapStart.current = { x: e.clientX, y: e.clientY, multi: false }
    else if (tapStart.current) tapStart.current.multi = true
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const pts = pointers.current
    const prev = pts.get(e.pointerId)
    if (!photoMovable || !prev || scale === 0) return
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
    const start = tapStart.current
    if (!start || pointers.current.size > 0) return
    tapStart.current = null
    // A tap = one finger that barely moved.
    if (start.multi || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return
    const now = e.timeStamp
    const last = lastTap.current
    if (now - last.time < 320 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 40) {
      lastTap.current = { time: 0, x: 0, y: 0 }
      onCropReset?.()
    } else {
      lastTap.current = { time: now, x: e.clientX, y: e.clientY }
    }
  }

  const { textStyle } = template
  const slotStyle = (slot: (typeof slots)[number]) => ({
    left: slot.x,
    top: slot.y,
    width: slot.w,
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
            style={{ left: box.x, top: box.y, width: box.w, height: box.h, touchAction: photoMovable ? 'none' : 'auto' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={(e) => {
              pointers.current.delete(e.pointerId)
              tapStart.current = null
            }}
          >
            {empty ? (
              // Template sizes: 1080px canvas, so type here is large (shown scaled down).
              // Read-only previews (e.g. Templates page) just show the plain gray box.
              editable && (
              <button
                type="button"
                disabled={!editable || !onPhotoTap}
                onClick={onPhotoTap}
                className="flex size-full cursor-pointer flex-col items-center justify-center gap-10 text-white disabled:cursor-default"
              >
                <svg width="160" height="160" viewBox="0 0 106 106" fill="none" aria-hidden>
                  <path d="M35.3333 53H53M53 53H70.6667M53 53V35.3333M53 53V70.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="53" cy="53" r="44.1667" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="text-[52px] leading-none">Tap to add a photo</span>
              </button>
              )
            ) : (
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
            )}
          </div>

          {/* Text slots: typed into directly, no separate field. Text wraps downward. */}
          {slots.map((slot, i) => {
            const value = photo.texts[i]
            const lines = value ? wrapLines(value, font, slot.w) : [slot.placeholder]
            const height = Math.max(1, lines.length) * textStyle.lineHeight
            if (!editable) {
              return (
                <div key={i} className="absolute whitespace-pre" style={{ ...slotStyle(slot), height, opacity: value ? 1 : 0.5 }}>
                  {lines.join('\n')}
                </div>
              )
            }
            return (
              <textarea
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                value={value}
                rows={1}
                onChange={(e) => onTextChange?.(i, fitText(value, e.target.value, font, slot.w, slot.maxLines))}
                onFocus={() => onTextFocus?.(i)}
                onBlur={onTextBlur}
                placeholder={slot.placeholder}
                aria-label={`${slot.placeholder} for ${label}`}
                data-text-slot={i}
                autoComplete="off"
                spellCheck={false}
                className="absolute resize-none overflow-hidden bg-transparent p-0 break-words whitespace-pre-wrap outline-none placeholder:text-current placeholder:opacity-50"
                style={{ ...slotStyle(slot), height }}
              />
            )
          })}

          {/* Big tap zones below the photo so a tiny text line is easy to hit before zooming in */}
          {editable &&
            editingSlot === null &&
            slots.map((_, i) => {
              const top = box.y + box.h
              const left = slots.length === 1 ? 0 : i === 0 ? 0 : template.width / 2
              return (
                <button
                  key={`zone-${i}`}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => inputRefs.current[i]?.focus()}
                  className="absolute cursor-text"
                  style={{ left, top, width: template.width / slots.length, height: template.height - top }}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}
