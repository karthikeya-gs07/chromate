import { MAX_PHOTOS, type Photo } from './formats'
import { pickImages } from './pickImages'

export const newId = () => crypto.randomUUID().slice(0, 8)

// A design with no image yet: the editor shows "Tap to add a photo" in the gray box.
export function emptyPhoto(): Photo {
  return { id: newId(), file: null, url: '', width: 1, height: 1, crop: null, texts: ['', ''], layout: 'single' }
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

export async function loadPhoto(file: Blob): Promise<Photo> {
  return { ...emptyPhoto(), ...(await readImage(file)) }
}


async function loadAll(files: File[]) {
  const loaded = await Promise.allSettled(files.map(loadPhoto))
  return loaded.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
}

// Opens the picker for several photos and loads the ones that decode.
export async function pickBatchPhotos(limit = MAX_PHOTOS) {
  return loadAll((await pickImages({ multiple: true })).slice(0, limit))
}
