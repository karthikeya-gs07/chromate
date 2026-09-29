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
  // Gray box in Figma: where the user's photo goes.
  photo: Rect
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
  slots: {
    single: [{ x: 195, y: 1222, w: 690, h: 26, align: 'center', placeholder: 'Text-space', maxLines: 1 }],
    double: [
      { x: 90, y: 1222, w: 410, h: 26, align: 'left', placeholder: 'Text-space 1', maxLines: 1 },
      { x: 581, y: 1222, w: 410, h: 26, align: 'right', placeholder: 'Text-space 2', maxLines: 1 },
    ],
  },
  textStyle,
}

export const TEMPLATES: Record<Format, Template> = { story, post }

export const templateFont = (t: Template) => `${t.textStyle.fontWeight} ${t.textStyle.fontSize}px Nohemi`
