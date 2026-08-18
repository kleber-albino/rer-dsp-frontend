export type MapClickCoords = {
  lat: number
  lng: number
}

const PRIMARY_WORLD_LNG_MIN = -180
const PRIMARY_WORLD_LNG_MAX = 180

/** Longitude outside the primary world copy (first map). */
export function isOutsidePrimaryWorldLongitude(lng: number): boolean {
  return lng < PRIMARY_WORLD_LNG_MIN || lng > PRIMARY_WORLD_LNG_MAX
}

export function normalizeLongitude(lng: number): number {
  if (lng >= PRIMARY_WORLD_LNG_MIN && lng <= PRIMARY_WORLD_LNG_MAX) {
    return lng
  }

  let shifted = lng - 360 * Math.round(lng / 360)
  if (shifted > PRIMARY_WORLD_LNG_MAX) {
    shifted -= 360
  }
  if (shifted < PRIMARY_WORLD_LNG_MIN) {
    shifted += 360
  }
  return shifted
}

/**
 * Converts a click on any horizontal world copy to the equivalent point
 * on the primary map (lng in [-180, 180]).
 */
export function toPrimaryWorldClickCoords(lat: number, lng: number): MapClickCoords {
  const normalizedLng = normalizeLongitude(lng)
  const clampedLat = Math.max(-90, Math.min(90, lat))

  return {
    lat: roundCoord(clampedLat),
    lng: roundCoord(normalizedLng),
  }
}

function roundCoord(value: number): number {
  return Math.round(value * 1e8) / 1e8
}

/** @deprecated Use toPrimaryWorldClickCoords */
export function normalizeMapClickCoords(lat: number, lng: number): MapClickCoords {
  return toPrimaryWorldClickCoords(lat, lng)
}
