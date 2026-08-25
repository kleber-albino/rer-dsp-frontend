import { httpGet } from '@/services/httpClient'
import type { AboutConfig } from '@/types/aboutConfig'

const FALLBACK_ABOUT_CONFIG: AboutConfig = {
  enabled: false,
  bannerTitle: 'About',
  defaultTabId: '',
  tabs: [],
}

let cachedConfig: AboutConfig | null = null

export async function getAboutConfig(): Promise<AboutConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    cachedConfig = await httpGet<AboutConfig>('config/about')
    return cachedConfig
  } catch (error) {
    console.warn('About config unavailable — hiding About tabs.', error)
    cachedConfig = FALLBACK_ABOUT_CONFIG
    return cachedConfig
  }
}

export function resetAboutConfigCache(): void {
  cachedConfig = null
}
