import type { Format, Photo } from './formats'
import { TEMPLATES, templateFont, type Template } from './templates'
import { coverScale, resolveCrop } from './crop'
import { wrapLines } from './text'

// Export at 2× the template size (story: 2160×3840). Layout stays in template pixels.
const EXPORT_SCALE = 2

// Renders one photo into the template at EXPORT_SCALE resolution.
async function renderPhoto(photo: Photo, template: Template): Promise<Blob> {
  const { width, height, photo: box } = template
  const canvas = document.createElement('canvas')
  canvas.width = width * EXPORT_SCALE
  canvas.height = height * EXPORT_SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE)

  ctx.fillStyle = template.background
  ctx.fillRect(0, 0, width, height)

  const bitmap = await createImageBitmap(photo.file!)
  const crop = resolveCrop(photo, box)
  const s = coverScale(photo, box) * crop.zoom
  ctx.save()
  ctx.beginPath()
  ctx.rect(box.x, box.y, box.w, box.h)
  ctx.clip()
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, box.x + crop.ox, box.y + crop.oy, photo.width * s, photo.height * s)
  ctx.restore()
  bitmap.close()

  ctx.font = templateFont(template)
  ctx.fillStyle = template.textStyle.color
  ctx.textBaseline = 'middle'
  template.slots[photo.layout].forEach((slot, i) => {
    const value = photo.texts[i].trim()
    if (!value) return
    ctx.textAlign = slot.align
    const x = slot.align === 'left' ? slot.x : slot.align === 'right' ? slot.x + slot.w : slot.x + slot.w / 2
    const { lineHeight } = template.textStyle
    wrapLines(value, ctx.font, slot.w).forEach((line, n) => {
      ctx.fillText(line, x, slot.y + lineHeight / 2 + n * lineHeight, slot.w)
    })
  })

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), 'image/jpeg', 0.92),
  )
}

// Saves via the share sheet (iOS "Save Images" → Photos); falls back to file downloads.
// Returns false if the user cancelled the share sheet, so callers keep their work.
export async function exportAll(photos: Photo[], format: Format): Promise<boolean> {
  photos = photos.filter((p) => p.file)
  if (photos.length === 0) return false
  const template = TEMPLATES[format]
  await document.fonts.load(templateFont(template))

  const files: File[] = []
  for (const [i, photo] of photos.entries()) {
    const blob = await renderPhoto(photo, template)
    files.push(new File([blob], `chromate-${format}-${String(i + 1).padStart(2, '0')}.jpg`, { type: 'image/jpeg' }))
  }

  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files })
      return true
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return false
    }
  }

  for (const file of files) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return true
}
