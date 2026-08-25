export interface AboutTabConfig {
  id: string
  label: string
  content: string
}

export interface AboutConfig {
  enabled: boolean
  bannerTitle: string
  defaultTabId: string
  tabs: AboutTabConfig[]
}
