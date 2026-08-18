import { describe, expect, it } from 'vitest'
import {
  isOutsidePrimaryWorldLongitude,
  normalizeLongitude,
  normalizeMapClickCoords,
  toPrimaryWorldClickCoords,
} from '@/utils/normalizeMapCoordinates'

describe('normalizeMapCoordinates', () => {
  describe('isOutsidePrimaryWorldLongitude', () => {
    it('should detect longitude outside the primary world', () => {
      expect(isOutsidePrimaryWorldLongitude(200)).toBe(true)
      expect(isOutsidePrimaryWorldLongitude(-220)).toBe(true)
      expect(isOutsidePrimaryWorldLongitude(-47.85)).toBe(false)
    })
  })

  describe('normalizeLongitude', () => {
    it('should wrap longitude above 180', () => {
      expect(normalizeLongitude(200)).toBeCloseTo(-160, 5)
    })

    it('should wrap longitude below -180', () => {
      expect(normalizeLongitude(-190)).toBeCloseTo(170, 5)
    })

    it('should keep valid longitude unchanged', () => {
      expect(normalizeLongitude(-47.85)).toBeCloseTo(-47.85, 5)
    })
  })

  describe('toPrimaryWorldClickCoords', () => {
    it('should convert a click on an eastern world copy to the primary map', () => {
      expect(toPrimaryWorldClickCoords(-15.75, -47.85 + 360)).toEqual({
        lat: -15.75,
        lng: -47.85,
      })
    })

    it('should convert a click on a western world copy to the primary map', () => {
      expect(toPrimaryWorldClickCoords(-15.75, -47.85 - 360)).toEqual({
        lat: -15.75,
        lng: -47.85,
      })
    })

    it('should normalize longitude and clamp latitude', () => {
      expect(toPrimaryWorldClickCoords(95, 200)).toEqual({
        lat: 90,
        lng: -160,
      })
    })

    it('should clamp negative latitude', () => {
      expect(toPrimaryWorldClickCoords(-100, -47.85)).toEqual({
        lat: -90,
        lng: -47.85,
      })
    })

    it('should keep normalizeMapClickCoords as an alias', () => {
      expect(normalizeMapClickCoords(-15.75, 312.15)).toEqual({
        lat: -15.75,
        lng: -47.85,
      })
    })
  })
})
