import { describe, expect, it } from 'vitest'
import { getAboutTabById, isAboutTabId } from '@/config/aboutUi'
import type { AboutTabConfig } from '@/types/aboutConfig'

const tabs: AboutTabConfig[] = [
  { id: 'overview', label: 'Overview', content: '# Overview' },
  { id: 'license', label: 'License', content: '# License' },
]

describe('aboutUi helpers', () => {
  it('should validate tab ids against the provided tabs', () => {
    expect(isAboutTabId(tabs, 'overview')).toBe(true)
    expect(isAboutTabId(tabs, 'roadmap')).toBe(false)
    expect(isAboutTabId(tabs, null)).toBe(false)
  })

  it('should resolve a tab by id', () => {
    expect(getAboutTabById(tabs, 'license', 'overview')?.id).toBe('license')
  })

  it('should fall back to the default tab id for unknown ids', () => {
    expect(getAboutTabById(tabs, 'invalid', 'overview')?.id).toBe('overview')
    expect(getAboutTabById(tabs, null, 'overview')?.id).toBe('overview')
  })

  it('should fall back to the first tab when the default id is also unknown', () => {
    expect(getAboutTabById(tabs, 'invalid', 'also-invalid')?.id).toBe('overview')
  })
})
