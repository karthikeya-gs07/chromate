import type { Crop, DetailTune, Photo } from './formats'
import type { Rect } from './templates'

export const MAX_ZOOM = 5

// Scale that makes the photo just cover the box.
export function coverScale(photo: Pick<Photo, 'width' | 'height'>, box: Rect) {
  return Math.max(box.w / photo.width, box.h / photo.height)
}

// Keeps zoom in range and the box fully covered (no empty edges).
export function clampCrop(photo: Pick<Photo, 'width' | 'height'>, box: Rect, crop: Crop, maxZoom = MAX_ZOOM): Crop {
  const zoom = Math.min(Math.max(crop.zoom, 1), maxZoom)
  const s = coverScale(photo, box) * zoom
  const w = photo.width * s
  const h = photo.height * s
  return {
    zoom,
    ox: Math.min(0, Math.max(box.w - w, crop.ox)),
    oy: Math.min(0, Math.max(box.h - h, crop.oy)),
  }
}

export function resolveCrop(photo: Photo, box: Rect): Crop {
  if (photo.crop) return clampCrop(photo, box, photo.crop)
  const s = coverScale(photo, box)
  return { zoom: 1, ox: (box.w - photo.width * s) / 2, oy: (box.h - photo.height * s) / 2 }
}

// Zoom around a point (px, py) given in box coordinates.
export function zoomAround(
  photo: Photo,
  box: Rect,
  crop: Crop,
  factor: number,
  px: number,
  py: number,
  maxZoom = MAX_ZOOM,
): Crop {
  const zoom = Math.min(Math.max(crop.zoom * factor, 1), maxZoom)
  const k = zoom / crop.zoom
  return clampCrop(photo, box, { zoom, ox: px - (px - crop.ox) * k, oy: py - (py - crop.oy) * k }, maxZoom)
}

// ---- Close-up box: the same photo, following the main box, `detail.zoom`× closer ----

// The close-up starts 1.5× closer than a main box that can be at MAX_ZOOM, plus its own zoom.
export const DETAIL_MAX_ZOOM = MAX_ZOOM * 3

type Detail = { box: Rect; zoom: number }
type View = { s: number; cx: number; cy: number }

// Scale and the photo point (photo px) shown at the box centre.
function viewOf(photo: Photo, box: Rect, crop: Crop): View {
  const s = coverScale(photo, box) * crop.zoom
  return { s, cx: (box.w / 2 - crop.ox) / s, cy: (box.h / 2 - crop.oy) / s }
}

// Close-up before fine-tuning: same centre as the main box, showing 1/zoom of its width.
function detailBase(photo: Photo, main: Rect, detail: Detail): View {
  const m = viewOf(photo, main, resolveCrop(photo, main))
  return { s: (m.s * detail.zoom * detail.box.w) / main.w, cx: m.cx, cy: m.cy }
}

export function resolveDetailCrop(photo: Photo, main: Rect, detail: Detail): Crop {
  const b = detailBase(photo, main, detail)
  const t = photo.detail ?? { zoom: 1, dx: 0, dy: 0 }
  const s = b.s * t.zoom
  const cx = b.cx + t.dx * photo.width
  const cy = b.cy + t.dy * photo.height
  const { box } = detail
  return clampCrop(
    photo,
    box,
    { zoom: s / coverScale(photo, box), ox: box.w / 2 - cx * s, oy: box.h / 2 - cy * s },
    DETAIL_MAX_ZOOM,
  )
}

// After the user drags/pinches the close-up: store it as a tune relative to the main box.
export function detailTuneFrom(photo: Photo, main: Rect, detail: Detail, crop: Crop): DetailTune {
  const b = detailBase(photo, main, detail)
  const v = viewOf(photo, detail.box, crop)
  return { zoom: v.s / b.s, dx: (v.cx - b.cx) / photo.width, dy: (v.cy - b.cy) / photo.height }
}
