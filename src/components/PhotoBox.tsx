import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { Crop, Photo } from '../lib/formats'
import type { Rect } from '../lib/templates'
import { clampCrop, coverScale, MAX_ZOOM, zoomAround } from '../lib/crop'

type Props = {
  box: Rect
  photo: Photo
  crop: Crop
  label: string
  // Drag/pinch enabled.
  movable: boolean
  maxZoom?: number
  onCropChange?: (crop: Crop) => void
  // Double-tap: back to the default framing.
  onReset?: () => void
  // Shown instead of the image while no photo is picked.
  empty?: ReactNode
}

// One gray box of a template, in template pixels: shows the photo and handles drag, pinch and double-tap.
export default function PhotoBox({ box, photo, crop, label, movable, maxZoom = MAX_ZOOM, onCropChange, onReset, empty }: Props) {
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  // Tap tracking for double-tap reset: where the current touch started, and the last tap.
  const tapStart = useRef<{ x: number; y: number; multi: boolean } | null>(null)
  const lastTap = useRef({ time: 0, x: 0, y: 0 })
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
    if (!movable) return
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
    if (!movable || !prev) return
    // On-screen px per template px (includes any zoom applied by a parent).
    const rect = e.currentTarget.getBoundingClientRect()
    const k = rect.width / box.w
    if (k === 0) return

    if (pts.size === 1) {
      const c = cropRef.current
      update(clampCrop(photo, box, { ...c, ox: c.ox + (e.clientX - prev.x) / k, oy: c.oy + (e.clientY - prev.y) / k }, maxZoom))
    } else if (pts.size === 2) {
      const other = [...pts.entries()].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
      const mx = ((e.clientX + other.x) / 2 - rect.left) / k
      const my = ((e.clientY + other.y) / 2 - rect.top) / k
      if (before > 0) update(zoomAround(photo, box, cropRef.current, after / before, mx, my, maxZoom))
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
      onReset?.()
    } else {
      lastTap.current = { time: now, x: e.clientX, y: e.clientY }
    }
  }

  return (
    <div
      className="absolute overflow-hidden bg-[#9e9e9e]"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, touchAction: movable ? 'none' : 'auto' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={(e) => {
        pointers.current.delete(e.pointerId)
        tapStart.current = null
      }}
    >
      {photo.file === null ? (
        empty
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
  )
}
