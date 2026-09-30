import { describe, expect, it } from 'vitest'
import { clampCrop, coverScale, MAX_ZOOM, resolveCrop, zoomAround } from './crop'
import type { Photo } from './formats'

const box = { x: 90, y: 248, w: 901, h: 1289 }
const landscape = { width: 1600, height: 1200 } as Photo
const photo = (crop: Photo['crop'] = null) => ({ ...landscape, crop }) as Photo

// Photo must always cover the box: left/top edge at or before 0, right/bottom edge at or after the box size.
function covers(p: Photo, c: { zoom: number; ox: number; oy: number }) {
  const s = coverScale(p, box) * c.zoom
  return c.ox <= 0 && c.oy <= 0 && c.ox + p.width * s >= box.w - 1e-6 && c.oy + p.height * s >= box.h - 1e-6
}

describe('crop', () => {
  it('cover scale fills the box on the tighter side', () => {
    const s = coverScale(landscape, box)
    expect(landscape.height * s).toBeCloseTo(box.h)
    expect(landscape.width * s).toBeGreaterThanOrEqual(box.w)
  })

  it('default crop is centered at zoom 1', () => {
    const c = resolveCrop(photo(), box)
    const s = coverScale(landscape, box)
    expect(c.zoom).toBe(1)
    expect(c.oy).toBeCloseTo(0)
    expect(c.ox).toBeCloseTo((box.w - landscape.width * s) / 2)
  })

  it('clamps panning so no empty edge shows', () => {
    const far = clampCrop(landscape, box, { zoom: 1, ox: 5000, oy: -5000 })
    expect(covers(photo(), far)).toBe(true)
    expect(far.ox).toBe(0)
  })

  it('clamps zoom between 1 and MAX_ZOOM', () => {
    expect(clampCrop(landscape, box, { zoom: 0.2, ox: 0, oy: 0 }).zoom).toBe(1)
    expect(clampCrop(landscape, box, { zoom: 99, ox: 0, oy: 0 }).zoom).toBe(MAX_ZOOM)
  })

  it('zooming keeps the pinch point steady and the box covered', () => {
    const start = resolveCrop(photo(), box)
    const px = 450
    const py = 600
    const next = zoomAround(photo(), box, start, 2, px, py)
    expect(next.zoom).toBe(2)
    expect(covers(photo(), next)).toBe(true)
    // Photo pixel under the pinch point is the same before and after.
    const s0 = coverScale(landscape, box) * start.zoom
    const s1 = coverScale(landscape, box) * next.zoom
    expect((px - next.ox) / s1).toBeCloseTo((px - start.ox) / s0)
    expect((py - next.oy) / s1).toBeCloseTo((py - start.oy) / s0)
  })

  it('reset (crop = null) returns to the default', () => {
    const moved = photo({ zoom: 3, ox: -900, oy: -700 })
    expect(resolveCrop(moved, box)).not.toEqual(resolveCrop(photo(), box))
    expect(resolveCrop({ ...moved, crop: null }, box)).toEqual(resolveCrop(photo(), box))
  })
})
