import { describe, expect, it } from 'vitest'
import { clampCrop, coverScale, detailTuneFrom, MAX_ZOOM, resolveCrop, resolveDetailCrop, zoomAround } from './crop'
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

  describe('close-up box', () => {
    const main = { x: 0, y: 1068, w: 1080, h: 852 }
    const detail = { box: { x: 205, y: 295, w: 670, h: 528 }, zoom: 1.5 }
    const p = (extra: Partial<Photo> = {}) => ({ ...landscape, crop: null, detail: null, ...extra }) as Photo
    // Photo point at a box's centre.
    const centre = (r: typeof main, c: { zoom: number; ox: number; oy: number }) => {
      const s = coverScale(landscape, r) * c.zoom
      return [(r.w / 2 - c.ox) / s, (r.h / 2 - c.oy) / s]
    }

    it('shows the main box centre, 1.5× closer', () => {
      const m = resolveCrop(p(), main)
      const d = resolveDetailCrop(p(), main, detail)
      const sm = coverScale(landscape, main) * m.zoom
      const sd = coverScale(landscape, detail.box) * d.zoom
      expect((sd * main.w) / detail.box.w / sm).toBeCloseTo(1.5)
      expect(centre(detail.box, d)[0]).toBeCloseTo(centre(main, m)[0])
      expect(centre(detail.box, d)[1]).toBeCloseTo(centre(main, m)[1])
    })

    it('follows the main box when it moves', () => {
      const moved = clampCrop(landscape, main, { zoom: 2, ox: -300, oy: -200 })
      const d = resolveDetailCrop(p({ crop: moved }), main, detail)
      expect(centre(detail.box, d)[0]).toBeCloseTo(centre(main, moved)[0])
    })

    it('a fine-tune round-trips through detailTuneFrom', () => {
      const target = resolveDetailCrop(p({ detail: { zoom: 1.3, dx: 0.05, dy: -0.02 } }), main, detail)
      const tune = detailTuneFrom(p(), main, detail, target)
      const again = resolveDetailCrop(p({ detail: tune }), main, detail)
      expect(again.zoom).toBeCloseTo(target.zoom)
      expect(again.ox).toBeCloseTo(target.ox)
      expect(again.oy).toBeCloseTo(target.oy)
    })
  })
})
