import type {
  InitialMapViewConfig,
  InitialMapViewMode,
  InstallationConfig,
} from '@/types/installationConfig'

export type ResolvedInitialMapView = {
  center: [number, number]
  zoom: number
}

export type ResolvedInitialMapStrategy =
  | { kind: 'territorial_bbox' }
  | { kind: 'manual' | 'planet'; view: ResolvedInitialMapView }

export const PLANET_MAP_VIEW: ResolvedInitialMapView = {
  center: [0, 0],
  zoom: 0,
}

const MIN_ZOOM = 0
const MAX_ZOOM = 16
const VALID_MODES: InitialMapViewMode[] = ['territorial_bbox', 'manual', 'planet']

export function isValidInitialMapMode(
  mode: string | null | undefined,
): mode is InitialMapViewMode {
  return typeof mode === 'string' && VALID_MODES.includes(mode as InitialMapViewMode)
}

export function isValidManualInitialMapView(
  initialView: InitialMapViewConfig | null | undefined,
): initialView is InitialMapViewConfig & {
  mode: 'manual'
  latitude: number
  longitude: number
  zoom: number
} {
  if (!initialView || initialView.mode !== 'manual') {
    return false
  }

  const { latitude, longitude, zoom } = initialView
  if (
    typeof latitude !== 'number'
    || typeof longitude !== 'number'
    || typeof zoom !== 'number'
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || !Number.isInteger(zoom)
  ) {
    return false
  }

  return (
    latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180
    && zoom >= MIN_ZOOM
    && zoom <= MAX_ZOOM
  )
}

export function resolveInitialMapStrategy(
  config: InstallationConfig | null | undefined,
): ResolvedInitialMapStrategy {
  const mode = config?.map?.initialView?.mode
  if (!isValidInitialMapMode(mode)) {
    return { kind: 'territorial_bbox' }
  }

  if (mode === 'planet') {
    return { kind: 'planet', view: PLANET_MAP_VIEW }
  }

  if (mode === 'manual' && isValidManualInitialMapView(config?.map?.initialView)) {
    const initialView = config.map.initialView
    return {
      kind: 'manual',
      view: {
        center: [initialView.latitude, initialView.longitude],
        zoom: initialView.zoom,
      },
    }
  }

  if (mode === 'manual') {
    return { kind: 'territorial_bbox' }
  }

  return { kind: 'territorial_bbox' }
}

export function toResolvedMapView(
  strategy: ResolvedInitialMapStrategy,
): ResolvedInitialMapView | null {
  if (strategy.kind === 'territorial_bbox') {
    return null
  }
  return strategy.view
}
