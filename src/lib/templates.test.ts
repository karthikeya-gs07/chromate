import { describe, expect, it } from 'vitest'
import { TEMPLATE_BY_ID, TEMPLATES } from './templates'

describe('templates', () => {
  it('story matches the Figma frames (1080×1920, gray box 901×1289 at 90,248)', () => {
    const t = TEMPLATES.story
    expect([t.width, t.height]).toEqual([1080, 1920])
    expect(t.photo).toEqual({ x: 90, y: 248, w: 901, h: 1289 })
    expect(t.slots.single).toEqual([expect.objectContaining({ x: 195, y: 1583, w: 690, align: 'center' })])
    expect(t.slots.double).toEqual([
      expect.objectContaining({ x: 90, y: 1583, w: 410, align: 'left' }),
      expect.objectContaining({ x: 581, y: 1583, w: 410, align: 'right' }),
    ])
  })

  it('close-up matches the Figma frame (node 14:2)', () => {
    const t = TEMPLATE_BY_ID['closeup-story']
    expect([t.width, t.height]).toEqual([1080, 1920])
    expect(t.photo).toEqual({ x: 0, y: 1068, w: 1080, h: 852 })
    expect(t.detail).toEqual({ box: { x: 205, y: 295, w: 670, h: 528 }, zoom: 1.5 })
    expect(t.slots.single).toEqual([expect.objectContaining({ x: 195, y: 869, w: 690, align: 'center' })])
  })

  for (const [format, t] of Object.entries(TEMPLATE_BY_ID)) {
    it(`${format}: photo box and every text slot (at max lines) fit inside the canvas`, () => {
      expect(t.photo.x + t.photo.w).toBeLessThanOrEqual(t.width)
      expect(t.photo.y + t.photo.h).toBeLessThanOrEqual(t.height)
      for (const slot of [...t.slots.single, ...t.slots.double]) {
        expect(slot.x + slot.w).toBeLessThanOrEqual(t.width)
        // Text stays inside its zone (between the photo boxes).
        expect(slot.y).toBeGreaterThanOrEqual(t.textZone.y)
        expect(slot.y + slot.maxLines * t.textStyle.lineHeight).toBeLessThanOrEqual(t.textZone.y + t.textZone.h)
      }
    })

    it(`${format}: double slots don't overlap`, () => {
      const [a, b] = t.slots.double
      expect(a.x + a.w).toBeLessThanOrEqual(b.x)
    })
  }
})
