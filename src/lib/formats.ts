export type Format = 'story' | 'post'

// Photo position inside the template's photo box, in template pixels.
// zoom 1 = photo just covers the box; ox/oy = photo's top-left relative to the box.
export type Crop = { zoom: number; ox: number; oy: number }

// Fine-tune of a template's close-up box, on top of following the main box.
// zoom = extra zoom; dx/dy = centre shift as a fraction of the photo's width/height.
export type DetailTune = { zoom: number; dx: number; dy: number }

// single = one text field, double = two.
export type TextLayout = 'single' | 'double'

export type Photo = {
  id: string
  // Layout this design uses (see TEMPLATE_BY_ID).
  templateId: string
  // null = no image picked yet (empty template in the editor).
  file: Blob | null
  url: string
  width: number
  height: number
  crop: Crop | null // null = centered, zoom 1
  detail: DetailTune | null // null = follow the main box exactly
  // One entry per text slot; single uses texts[0], double uses both. Kept when switching layouts.
  texts: [string, string]
  layout: TextLayout
}
