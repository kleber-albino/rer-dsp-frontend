import type { MapOptionsConfig } from '@rural-environmental-registry/map_component/dist/types'

/** Minimum zoom level for map clicks to trigger AOI lookup. */
export const DSP_ZOOM_TO_ALLOW_CLICK = 8

export const DSP_MAP_OPTIONS: MapOptionsConfig = {
  map: {
    config: {
      id: 'dsp-home-map',
      center: [-14.2, -51.9],
      zoom: 10,
      removeControlLayers: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
    },
  },
  layersMenu: {
    size: 'medium',
    persist: false,
  },
  tools: {
    show: true,
    zoom: { show: true },
    fullscreen: { show: true },
    measureArea: { show: false },
    measureLine: { show: false },
    measurePolygon: { show: false },
  },
}

export const DSP_MAP_MEMORIAL = { show: false as const }
