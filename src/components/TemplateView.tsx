import { useLayoutEffect, useRef, useState } from 'react'
import type { Crop, Photo } from '../lib/formats'
import type { Template } from '../lib/templates'
import { clampCrop, coverScale, resolveCrop, zoomAround } from '../lib/crop'

type Props = {
  template: Template
  photo: Photo
  // When true, the photo box captures drag/pinch; otherwise touches scroll the page.
  active: boolean
  onActivate: () => void
  onCropChange: (crop: Crop) => void
  onTextTap: () => void
  label: string
}

// Renders the template at its real pixel size, scaled down to fit the container.
export default function TemplateView({ template, photo, active, onActivate, onCropChange, onTextTap, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const moved = useRef(false)

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
    onCropChange(next)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    moved.current = false
    if (!active) return
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
    if (!active || !prev || scale === 0) return
    moved.current = true

    if (pts.size === 1) {
      const c = cropRef.current
      update(clampCrop(photo, box, { ...c, ox: c.ox + (e.clientX - prev.x) / scale, oy: c.oy + (e.clientY - prev.y) / scale }))
    } else if (pts.size === 2) {
      const other = [...pts.entries()].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = ((e.clientX + other.x) / 2 - rect.left) / scale
      const my = ((e.clientY + other.y) / 2 - rect.top) / scale
      if (before > 0) update(zoomAround(photo, box, cropRef.current, after / before, mx, my))
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId)
  }

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden transition-shadow ${active ? 'ring-2 ring-cream ring-offset-2 ring-offset-black' : ''}`}
      style={{ aspectRatio: `${template.width} / ${template.height}` }}
      onClick={() => !active && !moved.current && onActivate()}
    >
      {scale > 0 && (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: template.width, height: template.height, background: template.background, transform: `scale(${scale})` }}
        >
          {/* Photo box */}
          <div
            className="absolute overflow-hidden bg-[#9e9e9e]"
            style={{ left: box.x, top: box.y, width: box.w, height: box.h, touchAction: active ? 'none' : 'auto' }}
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

          {/* Text slot. The tap area covers everything below the photo so it's easy to hit on small tiles. */}
          <button
            type="button"
            aria-label={`Edit text for ${label}`}
            onClick={(e) => {
              e.stopPropagation()
              onTextTap()
            }}
            className="absolute left-0 cursor-text"
            style={{ top: box.y + box.h, width: template.width, height: template.height - box.y - box.h }}
          >
            <span
              className="absolute overflow-hidden text-center whitespace-nowrap"
              style={{
                left: text.x,
                top: text.y - box.y - box.h,
                width: text.w,
                height: text.h,
                fontSize: text.fontSize,
                lineHeight: `${text.lineHeight}px`,
                fontWeight: text.fontWeight,
                color: text.color,
                opacity: photo.text ? 1 : 0.5,
              }}
            >
              {photo.text || text.placeholder}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
