import type { SelectOption } from '@/config/searchHierarchy'
import type { TerritoryOption } from '@/types/territory'
import type { HomeKpisConfig } from '@/types/installationConfig'
import type { TotalizerDTO } from '@/types/totalizer'
import type { KpiItem } from '@/config/homeKpis'
import { resolveHomeKpis } from '@/config/homeKpis'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'

export function territoryOptionsToSelectOptions(options: TerritoryOption[]): SelectOption[] {
  return options.map((option) => ({
    value: option.id,
    label: option.name,
  }))
}

/** Combines totalizers (values) with KPI config (labels/units/limits). */
export function totalizersToKpis(
  totalizers: TotalizerDTO[],
  kpiConfig: HomeKpisConfig = FALLBACK_INSTALLATION_CONFIG.kpis,
): KpiItem[] {
  return resolveHomeKpis(totalizers, kpiConfig)
}
