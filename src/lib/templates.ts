import type { Format } from './formats'

export type Rect = { x: number; y: number; w: number; h: number }

export type Template = {
  id: string
  name: string
  width: number
  height: number
  background: string
  // Gray box in Figma: where the user's photo goes.
  photo: Rect
  // Fixed single-line text slot.
  text: Rect & {
    fontSize: number
    lineHeight: number
    fontWeight: number
    color: string
    placeholder: string
  }
}

// Figma: "Single Text" (node 1:9542), 1080×1920
const singleTextStory: Template = {
  id: 'single-text-story',
  name: 'Single Text',
  width: 1080,
  height: 1920,
  background: '#ffffff',
  photo: { x: 90, y: 248, w: 901, h: 1289 },
  text: { x: 195, y: 1583, w: 690, h: 26, fontSize: 24, lineHeight: 26, fontWeight: 400, color: '#848484', placeholder: 'Text-space' },
}

// PROVISIONAL: no Post template in Figma yet — same margins as the story, fitted to 1080×1350.
const singleTextPost: Template = {
  id: 'single-text-post',
  name: 'Single Text',
  width: 1080,
  height: 1350,
  background: '#ffffff',
  photo: { x: 90, y: 90, w: 901, h: 1086 },
  text: { x: 195, y: 1222, w: 690, h: 26, fontSize: 24, lineHeight: 26, fontWeight: 400, color: '#848484', placeholder: 'Text-space' },
}

export const TEMPLATES: Record<Format, Template> = {
  story: singleTextStory,
  post: singleTextPost,
}

export const templateFont = (t: Template) => `${t.text.fontWeight} ${t.text.fontSize}px Nohemi`
