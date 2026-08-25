import { describe, expect, it } from 'vitest'
import {
  HIGHLIGHT_GEOMETRY_SIZE_THRESHOLD_BYTES,
  HIGHLIGHT_MAX_VERTICES,
  countGeoJsonVertices,
  estimateGeoJsonBytes,
  isLargeHighlightGeometry,
  prepareAoiHighlightGeometry,
  simplifyHighlightGeometry,
  simplifyHighlightGeometryToVertexBudget,
} from '@/utils/prepareAoiHighlightGeometry'

function buildPolygonGeoJson(pointCount: number): GeoJSON.FeatureCollection {
  const ring: [number, number][] = []
  for (let index = 0; index < pointCount; index += 1) {
    ring.push([-47.9 + index * 0.000001, -15.8 + index * 0.000001])
  }
  ring.push(ring[0]!)

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
        properties: {},
      },
    ],
  }
}

describe('prepareAoiHighlightGeometry', () => {
  it('should return the original geometry when below the size threshold', () => {
    const geojson = buildPolygonGeoJson(5)

    expect(isLargeHighlightGeometry(geojson)).toBe(false)
    expect(prepareAoiHighlightGeometry(geojson)).toBe(geojson)
  })

  it('should simplify large geometries before map highlight', () => {
    const geojson = buildPolygonGeoJson(40_000)

    expect(estimateGeoJsonBytes(geojson)).toBeGreaterThanOrEqual(
      HIGHLIGHT_GEOMETRY_SIZE_THRESHOLD_BYTES,
    )
    expect(isLargeHighlightGeometry(geojson)).toBe(true)

    const simplified = prepareAoiHighlightGeometry(geojson) as GeoJSON.FeatureCollection
    const originalRing = geojson.features[0]?.geometry.coordinates[0] ?? []
    const simplifiedRing =
      simplified.features[0]?.geometry.type === 'Polygon'
        ? simplified.features[0].geometry.coordinates[0]
        : []

    expect(simplified.type).toBe('FeatureCollection')
    expect(simplifiedRing.length).toBeLessThan(originalRing.length)
    expect(countGeoJsonVertices(simplified)).toBeLessThanOrEqual(HIGHLIGHT_MAX_VERTICES)
    expect(estimateGeoJsonBytes(simplified)).toBeLessThan(estimateGeoJsonBytes(geojson))
  })

  it('should escalate tolerance until the vertex budget is reached', () => {
    const geojson = buildPolygonGeoJson(40_000)
    const result = simplifyHighlightGeometryToVertexBudget(geojson)

    expect(result.iterations).toBeGreaterThanOrEqual(1)
    expect(countGeoJsonVertices(result.geometry)).toBeLessThanOrEqual(HIGHLIGHT_MAX_VERTICES)
    expect(result.toleranceDegrees).toBeGreaterThanOrEqual(0.0001)
  })

  it('should preserve feature collection type when simplifying explicitly', () => {
    const geojson = buildPolygonGeoJson(40_000)
    const simplified = simplifyHighlightGeometry(geojson) as GeoJSON.FeatureCollection

    expect(simplified.type).toBe('FeatureCollection')
    expect(simplified.features).toHaveLength(1)
  })
})
