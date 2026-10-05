import type { HomeKpisConfig, KpiCardConfig } from '@/types/installationConfig'
import type { TotalizerDTO } from '@/types/totalizer'
import {
  FALLBACK_INSTALLATION_CONFIG,
  PRIMARY_KPI_CODE,
} from '@/config/installationConfigFallback'

export const MIN_HOME_KPIS = 1
export const MAX_HOME_KPIS = 5

export interface KpiItem {
  id: string
  title: string
  value: number
  unitOfMeasurement?: string
  optionalLabel?: string
  optionalValue?: number
  accentColor: string
}

/**
 * Builds dashboard cards from config (labels/units) + totalizer values.
 * - Up to 5 cards
 * - First card must be the primaryCode (registered properties)
 */
export function resolveHomeKpis(
  totalizers: TotalizerDTO[],
  kpiConfig: HomeKpisConfig = FALLBACK_INSTALLATION_CONFIG.kpis,
): KpiItem[] {
  const maxCards = clampMaxCards(kpiConfig.maxCards)
  const orderedCards = orderKpiCards(kpiConfig)

  if (!orderedCards.length) {
    return []
  }

  const valuesByCode = new Map(
    totalizers
      .filter((item) => item.code)
      .map((item) => [item.code as string, item]),
  )

  return orderedCards.slice(0, maxCards).map((card) => toKpiItem(card, valuesByCode.get(card.code)))
}

function clampMaxCards(maxCards: number): number {
  if (!Number.isFinite(maxCards) || maxCards < MIN_HOME_KPIS) {
    return MAX_HOME_KPIS
  }
  return Math.min(Math.floor(maxCards), MAX_HOME_KPIS)
}

function orderKpiCards(kpiConfig: HomeKpisConfig): KpiCardConfig[] {
  const primaryCode = kpiConfig.primaryCode || PRIMARY_KPI_CODE
  const sorted = [...kpiConfig.cards].sort((a, b) => a.order - b.order)
  const primary = sorted.find((card) => card.code === primaryCode)

  if (!primary) {
    console.warn(
      `[homeKpis] Primary KPI "${primaryCode}" is missing from configuration. Panel will be empty.`,
    )
    return []
  }

  const others = sorted.filter((card) => card.code !== primaryCode)
  return [primary, ...others]
}

function toKpiItem(card: KpiCardConfig, totalizer?: TotalizerDTO): KpiItem {
  const optionalValue = resolveOptionalValue(totalizer)

  return {
    id: card.code,
    title: card.label,
    value: Number(totalizer?.value ?? 0),
    unitOfMeasurement: card.unitOfMeasurement ?? undefined,
    optionalLabel:
      optionalValue === undefined
        ? undefined
        : (card.optionalLabel ?? totalizer?.subItemName ?? undefined) || undefined,
    optionalValue,
    accentColor: card.accentColor,
  }
}

function resolveOptionalValue(totalizer?: TotalizerDTO): number | undefined {
  if (!totalizer) {
    return undefined
  }
  const raw = totalizer.subItemValue
  if (raw === 0 || raw === '' || raw == null) {
    return undefined
  }
  return Number(raw)
}
