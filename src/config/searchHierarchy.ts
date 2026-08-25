import type {
  InstallationConfig,
  InstallationScreenId,
  ScreenFilterConfig,
} from '@/types/installationConfig'
import type { HierarchyLevelKey } from '@/types/hierarchy'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'

export type { HierarchyLevelKey }

export interface SelectOption {
  value: string
  label: string
}

export interface HierarchyFieldConfig {
  key: HierarchyLevelKey
  label: string
  placeholder: string
}

export interface IdentifierFieldConfig {
  key: string
  label: string
  placeholder: string
}

export interface ThemeFieldConfig {
  key: string
  label: string
  placeholder: string
}

export interface SearchFormConfig {
  title: string
  hierarchyKeys: HierarchyLevelKey[]
  identifier?: IdentifierFieldConfig
  theme?: ThemeFieldConfig
}

const LEVEL_KEYS: HierarchyLevelKey[] = ['level1', 'level2', 'level3']

export function buildHierarchyFieldsByKey(
  config: InstallationConfig = FALLBACK_INSTALLATION_CONFIG,
): Record<HierarchyLevelKey, HierarchyFieldConfig> {
  const byKey = {} as Record<HierarchyLevelKey, HierarchyFieldConfig>

  for (const key of LEVEL_KEYS) {
    const fromApi = config.hierarchy.find((level) => level.key === key)
    byKey[key] = {
      key,
      label: fromApi?.label ?? key,
      placeholder: fromApi?.placeholder ?? `Select ${key}`,
    }
  }

  return byKey
}

export function buildSearchFormConfig(
  config: InstallationConfig,
  screenId: InstallationScreenId,
): SearchFormConfig {
  const screen: ScreenFilterConfig = config.screens[screenId]
  return {
    title: screen.title,
    hierarchyKeys: [...screen.hierarchyKeys],
    identifier: screen.identifier
      ? {
          key: screen.identifier.key,
          label: screen.identifier.label,
          placeholder: screen.identifier.placeholder,
        }
      : undefined,
    theme: screen.theme
      ? {
          key: screen.theme.key,
          label: screen.theme.label,
          placeholder: screen.theme.placeholder,
        }
      : undefined,
  }
}

export function resolveHierarchyFields(
  keys: HierarchyLevelKey[],
  fieldsByKey: Record<HierarchyLevelKey, HierarchyFieldConfig> = buildHierarchyFieldsByKey(),
): HierarchyFieldConfig[] {
  return keys.map((key) => fieldsByKey[key])
}

/** Static fallbacks (tests / first render before the API). */
export const hierarchyFieldsByKey = buildHierarchyFieldsByKey()

export const homeSearchConfig = buildSearchFormConfig(FALLBACK_INSTALLATION_CONFIG, 'home')

export const downloadsSearchConfig = buildSearchFormConfig(
  FALLBACK_INSTALLATION_CONFIG,
  'downloads',
)
