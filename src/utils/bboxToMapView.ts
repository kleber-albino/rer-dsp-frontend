import type { TerritoryBoundaryBox } from '@/types/territory'

/** Viewport height fraction used by `.dsp-map` (aligned with consulta-publica). */
export const DSP_MAP_HEIGHT_VH = 70

/** Fallback map height in px when `window` is unavailable (SSR / tests). */
export const DSP_MAP_HEIGHT_FALLBACK_PX = 560

/** Reference width for estimating the zoom level before the map exists. */
export const DSP_MAP_WIDTH_PX = 960

/** Estimates `.dsp-map` height in pixels from the current viewport. */
export function getDspMapHeightPx(): number {
  if (typeof window !== 'undefined' && window.innerHeight > 0) {
    return Math.round(window.innerHeight * (DSP_MAP_HEIGHT_VH / 100))
  }
  return DSP_MAP_HEIGHT_FALLBACK_PX
}

const TILE_SIZE = 256
const MAX_ZOOM = 16
const PADDING_PX = 40

export type MapViewFromBbox = {
  center: [number, number]
  zoom: number
}

function latRad(lat: number): number {
  const sin = Math.sin((lat * Math.PI) / 180)
  const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
  return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
}

function zoomForAxis(mapPx: number, worldPx: number, fraction: number): number {
  if (fraction <= 0 || !Number.isFinite(fraction)) {
    return MAX_ZOOM
  }
  return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
}

/**
 * Converts a bounding box (minX/minY/maxX/maxY in lon/lat) into an approximate
 * center and zoom level to initialize Leaflet without a map instance.
 */
export function bboxToMapView(
  bbox: TerritoryBoundaryBox,
  mapSize: { width: number; height: number } = {
    width: DSP_MAP_WIDTH_PX,
    height: getDspMapHeightPx(),
  },
): MapViewFromBbox {
  const center: [number, number] = [
    (bbox.minY + bbox.maxY) / 2,
    (bbox.minX + bbox.maxX) / 2,
  ]

  const usableWidth = Math.max(mapSize.width - PADDING_PX * 2, 1)
  const usableHeight = Math.max(mapSize.height - PADDING_PX * 2, 1)

  const latFraction = (latRad(bbox.maxY) - latRad(bbox.minY)) / Math.PI
  let lngDiff = bbox.maxX - bbox.minX
  if (lngDiff < 0) {
    lngDiff += 360
  }
  const lngFraction = lngDiff / 360

  const latZoom = zoomForAxis(usableHeight, TILE_SIZE, latFraction)
  const lngZoom = zoomForAxis(usableWidth, TILE_SIZE, lngFraction)
  const zoom = Math.max(0, Math.min(latZoom, lngZoom, MAX_ZOOM))

  return { center, zoom }
}
