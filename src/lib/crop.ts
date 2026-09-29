import type { Crop, Photo } from './formats'
import type { Rect } from './templates'

export const MAX_ZOOM = 5

// Scale that makes the photo just cover the box.
export function coverScale(photo: Pick<Photo, 'width' | 'height'>, box: Rect) {
  return Math.max(box.w / photo.width, box.h / photo.height)
}

// Keeps zoom in range and the box fully covered (no empty edges).
export function clampCrop(photo: Pick<Photo, 'width' | 'height'>, box: Rect, crop: Crop): Crop {
  const zoom = Math.min(Math.max(crop.zoom, 1), MAX_ZOOM)
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
export function zoomAround(photo: Photo, box: Rect, crop: Crop, factor: number, px: number, py: number): Crop {
  const zoom = Math.min(Math.max(crop.zoom * factor, 1), MAX_ZOOM)
  const k = zoom / crop.zoom
  return clampCrop(photo, box, { zoom, ox: px - (px - crop.ox) * k, oy: py - (py - crop.oy) * k })
}
