import { describe, expect, it } from 'vitest'
import {
  PLANET_MAP_VIEW,
  isValidManualInitialMapView,
  resolveInitialMapStrategy,
} from '@/utils/resolveInitialMapView'
import type { InstallationConfig } from '@/types/installationConfig'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'

describe('resolveInitialMapView', () => {
  it('should default to territorial_bbox when map config is absent', () => {
    expect(resolveInitialMapStrategy(FALLBACK_INSTALLATION_CONFIG)).toEqual({
      kind: 'territorial_bbox',
    })
    expect(resolveInitialMapStrategy(null)).toEqual({ kind: 'territorial_bbox' })
  })

  it('should resolve manual mode with center and zoom', () => {
    const config: InstallationConfig = {
      ...FALLBACK_INSTALLATION_CONFIG,
      map: {
        initialView: {
          mode: 'manual',
          latitude: 39.5,
          longitude: -8.0,
          zoom: 7,
        },
      },
    }

    expect(resolveInitialMapStrategy(config)).toEqual({
      kind: 'manual',
      view: {
        center: [39.5, -8.0],
        zoom: 7,
      },
    })
  })

  it('should resolve planet mode', () => {
    const config: InstallationConfig = {
      ...FALLBACK_INSTALLATION_CONFIG,
      map: {
        initialView: {
          mode: 'planet',
        },
      },
    }

    expect(resolveInitialMapStrategy(config)).toEqual({
      kind: 'planet',
      view: PLANET_MAP_VIEW,
    })
  })

  it('should resolve territorial_bbox mode explicitly', () => {
    const config: InstallationConfig = {
      ...FALLBACK_INSTALLATION_CONFIG,
      map: {
        initialView: {
          mode: 'territorial_bbox',
        },
      },
    }

    expect(resolveInitialMapStrategy(config)).toEqual({ kind: 'territorial_bbox' })
  })

  it('should reject invalid manual coordinates', () => {
    expect(
      isValidManualInitialMapView({
        mode: 'manual',
        latitude: 120,
        longitude: -8,
        zoom: 7,
      }),
    ).toBe(false)
  })
})
