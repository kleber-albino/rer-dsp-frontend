export interface TotalizerDTO {
  name: string
  code?: string
  value: number
  subItemName?: string
  subItemValue?: number | string
  unitOfMeasurement?: string
}

export interface TotalizerFilterDTO {
  level2Ids: string[]
  level3Ids: string[]
}

export interface TerritoryLevelRefDTO {
  id?: string
  name?: string
}

export interface TerritoryLevelsDTO {
  level2?: TerritoryLevelRefDTO | null
  level3?: TerritoryLevelRefDTO | null
}

export interface DetailByIdentifierDTO {
  id?: string
  latitude?: string
  longitude?: string
  territory?: TerritoryLevelsDTO | null
  registrationDate?: string
  alterationDate?: string
  area?: number
  otherIds?: string[]
  /** Values for screens.home.detail.fields, keyed by field name. */
  attributes?: Record<string, unknown> | null
}
