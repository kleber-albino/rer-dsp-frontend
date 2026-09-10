import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  downloadFeaturesBundle,
  downloadThemeFile,
  getDownloadThemes,
  searchDownloads,
} from '@/services/downloadService'
import { httpGet, httpGetBlob, httpPost } from '@/services/httpClient'

vi.mock('@/services/httpClient', () => ({
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpGetBlob: vi.fn(),
}))

describe('downloadService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list themes from API', async () => {
    vi.mocked(httpGet).mockResolvedValue([
      { code: 'theme_alpha', name: 'Theme Alpha', formats: ['csv'], enabled: true },
    ])

    const themes = await getDownloadThemes()

    expect(httpGet).toHaveBeenCalledWith('downloads/themes')
    expect(themes).toHaveLength(1)
    expect(themes[0].code).toBe('theme_alpha')
  })

  it('should search downloads with filter', async () => {
    vi.mocked(httpPost).mockResolvedValue([
      {
        themeCode: 'theme_alpha',
        themeName: 'Theme Alpha',
        formats: [{ format: 'csv', status: 'available' }],
        lastUpdate: '2026-06-01',
        lastFileGenerated: '2026-06-02T10:00:00Z',
      },
    ])

    const items = await searchDownloads({ level2: 'DF', theme: null })

    expect(httpPost).toHaveBeenCalledWith('downloads/search', { level2: 'DF', theme: null })
    expect(items[0].themeCode).toBe('theme_alpha')
    expect(items[0].lastFileGenerated).toBe('2026-06-02T10:00:00Z')
  })

  it('should download file blob with fallback name', async () => {
    vi.mocked(httpGetBlob).mockResolvedValue({
      blob: new Blob(['mock']),
      fileName: null,
    })

    const result = await downloadThemeFile({
      level2: 'DF',
      theme: 'theme_alpha',
      format: 'csv',
    })

    expect(httpGetBlob).toHaveBeenCalledWith(
      'downloads/file?level2=DF&theme=theme_alpha&format=csv',
    )
    expect(result.fileName).toBe('DF_theme_alpha.csv')
  })

  it('should download features bundle with fallback name', async () => {
    vi.mocked(httpGetBlob).mockResolvedValue({
      blob: new Blob(['mock']),
      fileName: null,
    })

    const result = await downloadFeaturesBundle('DEMO-001')

    expect(httpGetBlob).toHaveBeenCalledWith(
      'downloads/features-bundle?aoiId=DEMO-001',
    )
    expect(result.fileName).toBe('DEMO-001_features.zip')
  })
})
