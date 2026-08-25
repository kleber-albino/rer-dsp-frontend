import { buildHierarchyFieldsByKey } from '@/config/searchHierarchy'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'
import type {
  DetailFieldConfigItem,
  HomeDetailSearchConfig,
  InstallationConfig,
} from '@/types/installationConfig'
import type { DetailByIdentifierDTO } from '@/types/totalizer'

export type FallbackDetailFieldKey =
  | 'id'
  | 'registrationDate'
  | 'alterationDate'
  | 'level3Name'
  | 'level2Name'
  | 'latitude'
  | 'longitude'
  | 'area'

/** Fallback union plus exclusive config keys (`registration_date`, `calculated.latitude`, extras). */
export type DetailFieldKey = FallbackDetailFieldKey | string

export interface DetailFieldConfig {
  key: string
  label: string
  group: 'header' | 'property'
  row?: number
  unitSuffix?: string
  formatAsMeasure?: boolean
  formatAsDate?: boolean
  fromAttributes?: boolean
}

export interface DetailByIdentifierConfig {
  sectionTitle: string
  areaOfInterestSectionTitle: string
  emptyValue: string
  fields: DetailFieldConfig[]
  featuresDownload: {
    label: string
    enabled: boolean
  }
}

const DEFAULT_DETAIL_LABELS: HomeDetailSearchConfig = {
  sectionTitle: 'Search details',
  areaOfInterestSectionTitle: 'Area of interest data',
  registrationDateLabel: 'Registration date',
  alterationDateLabel: 'Alteration date',
  latitudeLabel: 'Latitude',
  longitudeLabel: 'Longitude',
  areaLabel: 'Area',
  featuresDownloadLabel: 'Download features',
}

const DATE_ATTRIBUTE_FIELDS = new Set(['registration_date', 'updated_at'])

/** Attribute keys rendered with two decimal places via formatPropertyMeasures. */
const MEASURE_ATTRIBUTE_FIELDS = new Set(['area', 'perimeter_m'])

/** Property fields per row in the details panel. */
export const DETAIL_PROPERTY_COLUMNS = 3

export function configuredDetailFields(
  detail: HomeDetailSearchConfig | null | undefined,
): DetailFieldConfigItem[] {
  const raw = detail?.fields
  if (!Array.isArray(raw) || raw.length === 0) {
    return []
  }
  return raw.filter((item) => typeof item?.field === 'string' && item.field.trim() !== '')
}

export function buildDetailByIdentifierConfig(
  installation: InstallationConfig = FALLBACK_INSTALLATION_CONFIG,
): DetailByIdentifierConfig {
  const unitSuffix = installation.areaOfInterest.areaUnitLabel
  const hierarchy = buildHierarchyFieldsByKey(installation)
  const identifierLabel =
    installation.screens.home.identifier?.label ?? 'Identifier'
  const detail = installation.screens.home.detail ?? DEFAULT_DETAIL_LABELS
  const exclusive = configuredDetailFields(detail)

  return {
    sectionTitle: detail.sectionTitle,
    areaOfInterestSectionTitle: detail.areaOfInterestSectionTitle,
    emptyValue: '—',
    fields: exclusive.length > 0
      ? buildExclusiveFields(exclusive, unitSuffix)
      : buildFallbackFields(identifierLabel, detail, hierarchy.level2.label, hierarchy.level3.label, unitSuffix),
    featuresDownload: {
      label: detail.featuresDownloadLabel,
      enabled: true,
    },
  }
}

function buildExclusiveFields(
  items: DetailFieldConfigItem[],
  unitSuffix: string,
): DetailFieldConfig[] {
  return items.map((item, index) => {
    const key = item.field.trim()
    const isArea = key === 'area'
    const formatAsMeasure = MEASURE_ATTRIBUTE_FIELDS.has(key)
    return {
      key,
      label: item.label?.trim() || key,
      group: 'property',
      row: Math.floor(index / DETAIL_PROPERTY_COLUMNS) + 1,
      fromAttributes: true,
      formatAsDate: DATE_ATTRIBUTE_FIELDS.has(key),
      formatAsMeasure,
      unitSuffix: isArea ? unitSuffix : undefined,
    }
  })
}

function buildFallbackFields(
  identifierLabel: string,
  detail: HomeDetailSearchConfig,
  level2Label: string,
  level3Label: string,
  unitSuffix: string,
): DetailFieldConfig[] {
  return [
    {
      key: 'id',
      label: identifierLabel,
      group: 'header',
    },
    {
      key: 'registrationDate',
      label: detail.registrationDateLabel,
      group: 'header',
      formatAsDate: true,
    },
    {
      key: 'alterationDate',
      label: detail.alterationDateLabel,
      group: 'header',
      formatAsDate: true,
    },
    {
      key: 'level3Name',
      label: level3Label,
      group: 'property',
      row: 1,
    },
    {
      key: 'level2Name',
      label: level2Label,
      group: 'property',
      row: 1,
    },
    {
      key: 'latitude',
      label: detail.latitudeLabel,
      group: 'property',
      row: 1,
    },
    {
      key: 'longitude',
      label: detail.longitudeLabel,
      group: 'property',
      row: 2,
    },
    {
      key: 'area',
      label: detail.areaLabel,
      group: 'property',
      row: 2,
      unitSuffix,
      formatAsMeasure: true,
    },
  ]
}

export const detailByIdentifierConfig: DetailByIdentifierConfig =
  buildDetailByIdentifierConfig()

export function getDetailFieldsByGroup(
  group: DetailFieldConfig['group'],
  config: DetailByIdentifierConfig = detailByIdentifierConfig,
): DetailFieldConfig[] {
  return config.fields.filter((field) => field.group === group)
}

export function getPropertyFieldRows(
  config: DetailByIdentifierConfig = detailByIdentifierConfig,
): DetailFieldConfig[][] {
  const propertyFields = getDetailFieldsByGroup('property', config)
  const byRow = new Map<number, DetailFieldConfig[]>()

  for (const field of propertyFields) {
    const row = field.row ?? 1
    const list = byRow.get(row) ?? []
    list.push(field)
    byRow.set(row, list)
  }

  return [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, fields]) => fields)
}

export function readDetailFieldValue(
  detail: DetailByIdentifierDTO,
  field: DetailFieldConfig | string,
): string | number | undefined | null {
  if (typeof field !== 'string' && field.fromAttributes) {
    return readAttribute(detail, field.key)
  }
  const key = typeof field === 'string' ? field : field.key
  switch (key) {
    case 'id':
      return detail.id
    case 'registrationDate':
      return detail.registrationDate
    case 'alterationDate':
      return detail.alterationDate
    case 'latitude':
      return detail.latitude
    case 'longitude':
      return detail.longitude
    case 'area':
      return detail.area
    case 'level2Name':
      return detail.territory?.level2?.name
    case 'level3Name':
      return detail.territory?.level3?.name
    default:
      return undefined
  }
}

function readAttribute(
  detail: DetailByIdentifierDTO,
  key: string,
): string | number | undefined | null {
  const value = detail.attributes?.[key]
  if (value === undefined || value === null) {
    return value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  return String(value)
}
