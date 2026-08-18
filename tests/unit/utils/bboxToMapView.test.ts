import { describe, expect, it } from 'vitest'
import { bboxToMapView, getDspMapHeightPx, DSP_MAP_HEIGHT_FALLBACK_PX } from '@/utils/bboxToMapView'

describe('bboxToMapView', () => {
  it('should return the geographic center of the bbox', () => {
    const view = bboxToMapView({
      minX: -74,
      minY: -34,
      maxX: -34,
      maxY: 6,
    })

    expect(view.center[0]).toBeCloseTo(-14, 5)
    expect(view.center[1]).toBeCloseTo(-54, 5)
  })

  it('should return a lower zoom for a wider bbox', () => {
    const wide = bboxToMapView({
      minX: -74,
      minY: -34,
      maxX: -34,
      maxY: 6,
    })
    const narrow = bboxToMapView({
      minX: -48.2,
      minY: -16,
      maxX: -47.3,
      maxY: -15.5,
    })

    expect(wide.zoom).toBeLessThan(narrow.zoom)
    expect(wide.zoom).toBeGreaterThanOrEqual(0)
    expect(narrow.zoom).toBeLessThanOrEqual(16)
  })

  it('should use explicit mapSize without depending on window', () => {
    const view = bboxToMapView(
      {
        minX: -48.2,
        minY: -16,
        maxX: -47.3,
        maxY: -15.5,
      },
      { width: 960, height: 560 },
    )

    expect(view.center[0]).toBeCloseTo(-15.75, 5)
    expect(view.zoom).toBeGreaterThanOrEqual(0)
    expect(view.zoom).toBeLessThanOrEqual(16)
  })

  it('should fall back to a fixed height when window is unavailable', () => {
    const originalWindow = globalThis.window
    // @ts-expect-error simulate SSR
    delete globalThis.window

    expect(getDspMapHeightPx()).toBe(DSP_MAP_HEIGHT_FALLBACK_PX)

    globalThis.window = originalWindow
  })
})
