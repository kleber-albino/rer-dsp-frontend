import type { AboutTabConfig } from '@/types/aboutConfig'

export function isAboutTabId(tabs: AboutTabConfig[], value: string | null | undefined): boolean {
  return tabs.some((tab) => tab.id === value)
}

export function getAboutTabById(
  tabs: AboutTabConfig[],
  id: string | null | undefined,
  defaultTabId: string,
): AboutTabConfig | undefined {
  return tabs.find((tab) => tab.id === id) ?? tabs.find((tab) => tab.id === defaultTabId) ?? tabs[0]
}
