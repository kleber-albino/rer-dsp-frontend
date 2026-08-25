import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpGet } from '@/services/httpClient'
import { getAboutConfig, resetAboutConfigCache } from '@/services/aboutService'
import type { AboutConfig } from '@/types/aboutConfig'

vi.mock('@/services/httpClient', () => ({
  httpGet: vi.fn(),
}))

const CONFIG: AboutConfig = {
  enabled: true,
  bannerTitle: 'About',
  defaultTabId: 'overview',
  tabs: [{ id: 'overview', label: 'Overview', content: '# Overview' }],
}

describe('aboutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAboutConfigCache()
  })

  it('should load about config from API', async () => {
    vi.mocked(httpGet).mockResolvedValue(CONFIG)

    const result = await getAboutConfig()

    expect(httpGet).toHaveBeenCalledWith('config/about')
    expect(result).toEqual(CONFIG)
  })

  it('should cache about config', async () => {
    vi.mocked(httpGet).mockResolvedValue(CONFIG)

    await getAboutConfig()
    await getAboutConfig()

    expect(httpGet).toHaveBeenCalledTimes(1)
  })

  it('should fall back to a disabled config when the API fails', async () => {
    vi.mocked(httpGet).mockRejectedValue(new Error('offline'))

    const result = await getAboutConfig()

    expect(result.enabled).toBe(false)
    expect(result.tabs).toEqual([])
  })
})
