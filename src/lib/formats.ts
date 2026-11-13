export type Format = 'story' | 'post'

export const FORMATS: Record<Format, { label: string; plural: string; width: number; height: number }> = {
  story: { label: 'Story', plural: 'Stories', width: 1080, height: 1920 },
  post: { label: 'Post', plural: 'Posts', width: 1080, height: 1350 },
}

export const MAX_PHOTOS = 10

// Photo position inside the template's photo box, in template pixels.
// zoom 1 = photo just covers the box; ox/oy = photo's top-left relative to the box.
export type Crop = { zoom: number; ox: number; oy: number }

// single = one text field, double = two.
export type TextLayout = 'single' | 'double'

export type Photo = {
  id: string
  // null = no image picked yet (empty template in the editor).
  file: Blob | null
  url: string
  width: number
  height: number
  crop: Crop | null // null = centered, zoom 1
  // One entry per text slot; single uses texts[0], double uses both. Kept when switching layouts.
  texts: [string, string]
  layout: TextLayout
}
