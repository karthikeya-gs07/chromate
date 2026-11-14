import type { Photo } from './formats'
import { DEFAULT_TEMPLATE_ID } from './templates'

export const newId = () => crypto.randomUUID().slice(0, 8)

// A design with no image yet: the editor shows "Tap to add a photo" in the gray box.
export function emptyPhoto(templateId = DEFAULT_TEMPLATE_ID): Photo {
  return {
    id: newId(),
    templateId,
    file: null,
    url: '',
    width: 1,
    height: 1,
    crop: null,
    detail: null,
    texts: ['', ''],
    layout: 'single',
  }
}

// Reads an image's pixel size (EXIF orientation applied, same as <img> and createImageBitmap).
export async function readImage(file: Blob) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  try {
    await img.decode()
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
  return { file, url, width: img.naturalWidth, height: img.naturalHeight }
}
