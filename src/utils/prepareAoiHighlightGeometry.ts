import simplify from '@turf/simplify'

/** Geometries at or above this size are simplified before Leaflet rendering. */
export const HIGHLIGHT_GEOMETRY_SIZE_THRESHOLD_BYTES = 524_288 // 0.5 * 1024 * 1024 = 0,5 MiB

/** Fixed starting tolerance in degrees (~11 m at the equator). */
export const HIGHLIGHT_SIMPLIFY_TOLERANCE_DEGREES = 0.0001

/** Target vertex budget for map highlight after simplification. */
export const HIGHLIGHT_MAX_VERTICES = 5_000

/** Maximum tolerance escalation attempts for dense geometries. */
export const HIGHLIGHT_MAX_SIMPLIFY_ITERATIONS = 10

const HIGHLIGHT_SIMPLIFY_TOLERANCE_MULTIPLIER = 2

export function estimateGeoJsonBytes(geojson: GeoJSON.GeoJsonObject): number {
  return new Blob([JSON.stringify(geojson)]).size
}

function countRingVertices(ring: unknown): number {
  if (!Array.isArray(ring)) {
    return 0
  }
  return ring.length
}

function countGeometryVertices(geometry: GeoJSON.Geometry | null | undefined): number {
  if (!geometry) {
    return 0
  }

  switch (geometry.type) {
    case 'Point':
      return 1
    case 'MultiPoint':
      return geometry.coordinates.length
    case 'LineString':
      return countRingVertices(geometry.coordinates)
    case 'MultiLineString':
      return geometry.coordinates.reduce(
        (total, ring) => total + countRingVertices(ring),
        0,
      )
    case 'Polygon':
      return geometry.coordinates.reduce(
        (total, ring) => total + countRingVertices(ring),
        0,
      )
    case 'MultiPolygon':
      return geometry.coordinates.reduce(
        (total, polygon) =>
          total +
          polygon.reduce((polygonTotal, ring) => polygonTotal + countRingVertices(ring), 0),
        0,
      )
    case 'GeometryCollection':
      return geometry.geometries.reduce(
        (total, item) => total + countGeometryVertices(item),
        0,
      )
    default:
      return 0
  }
}

export function countGeoJsonVertices(geojson: GeoJSON.GeoJsonObject): number {
  if (geojson.type === 'Feature') {
    return countGeometryVertices(geojson.geometry)
  }
  if (geojson.type === 'FeatureCollection') {
    return geojson.features.reduce(
      (total, feature) => total + countGeometryVertices(feature.geometry),
      0,
    )
  }
  if (geojson.type === 'GeometryCollection') {
    return countGeometryVertices(geojson)
  }
  return countGeometryVertices(geojson as GeoJSON.Geometry)
}

export function isLargeHighlightGeometry(
  geojson: GeoJSON.GeoJsonObject,
  threshold = HIGHLIGHT_GEOMETRY_SIZE_THRESHOLD_BYTES,
): boolean {
  return estimateGeoJsonBytes(geojson) >= threshold
}

export function simplifyHighlightGeometry(
  geojson: GeoJSON.GeoJsonObject,
  tolerance = HIGHLIGHT_SIMPLIFY_TOLERANCE_DEGREES,
): GeoJSON.GeoJsonObject {
  return simplify(geojson, {
    tolerance,
    // highQuality overflows the stack on very dense WFS payloads (e.g. ~235k vertices).
    highQuality: false,
    mutate: false,
  })
}

export function simplifyHighlightGeometryToVertexBudget(
  geojson: GeoJSON.GeoJsonObject,
  maxVertices = HIGHLIGHT_MAX_VERTICES,
): { geometry: GeoJSON.GeoJsonObject; toleranceDegrees: number; iterations: number } {
  let tolerance = HIGHLIGHT_SIMPLIFY_TOLERANCE_DEGREES
  let simplified = simplifyHighlightGeometry(geojson, tolerance)
  let iterations = 1

  while (
    countGeoJsonVertices(simplified) > maxVertices &&
    iterations < HIGHLIGHT_MAX_SIMPLIFY_ITERATIONS
  ) {
    tolerance *= HIGHLIGHT_SIMPLIFY_TOLERANCE_MULTIPLIER
    simplified = simplifyHighlightGeometry(geojson, tolerance)
    iterations += 1
  }

  return {
    geometry: simplified,
    toleranceDegrees: tolerance,
    iterations,
  }
}

/**
 * Prepares AOI geometry for map highlight.
 * Large payloads are simplified client-side to reduce Leaflet render cost.
 * Note: JSON.parse of very large WFS responses may still block briefly.
 */
export function prepareAoiHighlightGeometry(
  geojson: GeoJSON.GeoJsonObject,
): GeoJSON.GeoJsonObject {
  if (!isLargeHighlightGeometry(geojson)) {
    return geojson
  }

  const { geometry: simplified } = simplifyHighlightGeometryToVertexBudget(geojson)
  return simplified
}
