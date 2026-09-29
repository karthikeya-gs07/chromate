import { FORMATS, type Format, type Photo } from './formats'

// Draws the photo cover-cropped into the full-size canvas.
// TODO: replace with the template renderer once the template arrives from Figma.
async function renderPhoto(photo: Photo, format: Format, index: number): Promise<File> {
  const { width, height } = FORMATS[format]
  const bitmap = await createImageBitmap(photo.file)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const scale = Math.max(width / bitmap.width, height / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), 'image/jpeg', 0.92),
  )
  return new File([blob], `chromate-${format}-${String(index + 1).padStart(2, "0")}.jpg`, { type: 'image/jpeg' })
}

// Saves via the share sheet (iOS "Save Images" → Photos); falls back to file downloads.
export async function exportAll(photos: Photo[], format: Format) {
  const files: File[] = []
  for (const [i, photo] of photos.entries()) files.push(await renderPhoto(photo, format, i))

  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files })
      return
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return
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
}
