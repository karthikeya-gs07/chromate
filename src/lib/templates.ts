import type { Format, TextLayout } from './formats'

export type Rect = { x: number; y: number; w: number; h: number }

// y/h describe the first line; text wraps downward, up to maxLines.
export type TextSlot = Rect & { align: 'left' | 'center' | 'right'; placeholder: string; maxLines: number }

export type Template = {
  id: string
  name: string
  width: number
  height: number
  background: string
  // Gray box in Figma: where the user's photo goes (drag/pinch adjusts it).
  photo: Rect
  // Optional second box showing the same photo closer up. It follows the main box
  // (same centre, `zoom`× closer) and can be fine-tuned on its own.
  detail?: { box: Rect; zoom: number }
  // Area under/around the text, tappable to start typing.
  textZone: { y: number; h: number }
  // Text slots per layout (index = which of the photo's texts it shows).
  slots: Record<TextLayout, TextSlot[]>
  textStyle: { fontSize: number; lineHeight: number; fontWeight: number; color: string }
}

const textStyle = { fontSize: 24, lineHeight: 26, fontWeight: 400, color: '#848484' }

// Figma: "Single Text" (node 1:9542) and "Double Text" (node 1:9537), 1080×1920
// Story text can wrap down to 90px above the bottom edge (same as the side margin): 9 lines.
const story: Template = {
  id: 'text-story',
  name: 'Text',
  width: 1080,
  height: 1920,
  background: '#ffffff',
  photo: { x: 90, y: 248, w: 901, h: 1289 },
  textZone: { y: 1537, h: 383 },
  slots: {
    single: [{ x: 195, y: 1583, w: 690, h: 26, align: 'center', placeholder: 'Text-space', maxLines: 9 }],
    double: [
      { x: 90, y: 1583, w: 410, h: 26, align: 'left', placeholder: 'Text-space 1', maxLines: 9 },
      { x: 581, y: 1583, w: 410, h: 26, align: 'right', placeholder: 'Text-space 2', maxLines: 9 },
    ],
  },
  textStyle,
}

// PROVISIONAL: no Post template in Figma yet — same margins as the story, fitted to 1080×1350.
const post: Template = {
  id: 'text-post',
  name: 'Text',
  width: 1080,
  height: 1350,
  background: '#ffffff',
  photo: { x: 90, y: 90, w: 901, h: 1086 },
  textZone: { y: 1176, h: 174 },
  slots: {
    single: [{ x: 195, y: 1222, w: 690, h: 26, align: 'center', placeholder: 'Text-space', maxLines: 1 }],
    double: [
      { x: 90, y: 1222, w: 410, h: 26, align: 'left', placeholder: 'Text-space 1', maxLines: 1 },
      { x: 581, y: 1222, w: 410, h: 26, align: 'right', placeholder: 'Text-space 2', maxLines: 1 },
    ],
  },
  textStyle,
}

// Figma: "Single Text" (file bqGw6NCdpGJz9h6xe5MK29, node 14:2), 1080×1920.
// Full-width photo at the bottom, the same photo 1.5× closer in the box on top, text in between.
// The double layout isn't in Figma: two columns lined up with the top box's edges.
const closeup: Template = {
  id: 'closeup-story',
  name: 'Close-up',
  width: 1080,
  height: 1920,
  background: '#ffffff',
  photo: { x: 0, y: 1068, w: 1080, h: 852 },
  detail: { box: { x: 205, y: 295, w: 670, h: 528 }, zoom: 1.5 },
  textZone: { y: 823, h: 245 },
  slots: {
    single: [{ x: 195, y: 869, w: 690, h: 26, align: 'center', placeholder: 'Text-space', maxLines: 6 }],
    double: [
      { x: 205, y: 869, w: 300, h: 26, align: 'left', placeholder: 'Text-space 1', maxLines: 6 },
      { x: 575, y: 869, w: 300, h: 26, align: 'right', placeholder: 'Text-space 2', maxLines: 6 },
    ],
  },
  textStyle,
}

export const TEMPLATES: Record<Format, Template> = { story, post }

// Every layout by id. A design (Photo) stores the id of the layout it was made with.
export const TEMPLATE_BY_ID: Record<string, Template> = Object.fromEntries(
  [story, post, closeup].map((t) => [t.id, t]),
)

export const DEFAULT_TEMPLATE_ID = story.id

export const templateOf = (photo: { templateId?: string }) =>
  TEMPLATE_BY_ID[photo.templateId ?? DEFAULT_TEMPLATE_ID] ?? story

export const templateFont = (t: Template) => `${t.textStyle.fontWeight} ${t.textStyle.fontSize}px Nohemi`

// Templates the user picks from on the Templates page (Stories only for now).
// `templateId` is the layout above; `kind` decides which editor opens.
export type CatalogTemplate = {
  id: string
  name: string
  description: string
  kind: 'batch' | 'single'
  templateId: string
}

export const STORY_TEMPLATES: CatalogTemplate[] = [
  { id: 'batch', name: 'Batch', description: 'Up to 10 photos at once', kind: 'batch', templateId: story.id },
  { id: 'single-text', name: 'Photo + text', description: 'One photo, single or double text', kind: 'single', templateId: story.id },
  { id: 'closeup', name: 'Close-up', description: 'One photo plus a zoomed-in detail', kind: 'single', templateId: closeup.id },
]
