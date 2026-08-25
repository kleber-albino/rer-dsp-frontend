import { describe, expect, it } from 'vitest'
import {
  buildDetailByIdentifierConfig,
  detailByIdentifierConfig,
  getDetailFieldsByGroup,
  getPropertyFieldRows,
  readDetailFieldValue,
} from '@/config/detailByIdentifier'
import { FALLBACK_INSTALLATION_CONFIG } from '@/config/installationConfigFallback'
import type { InstallationConfig } from '@/types/installationConfig'
import type { DetailByIdentifierDTO } from '@/types/totalizer'

const ptbrInstallation: InstallationConfig = {
  ...FALLBACK_INSTALLATION_CONFIG,
  hierarchy: [
    { key: 'level1', label: 'Região', placeholder: 'Selecione uma região', order: 1 },
    { key: 'level2', label: 'Estado', placeholder: 'Selecione um estado', order: 2 },
    { key: 'level3', label: 'Município', placeholder: 'Selecione um município', order: 3 },
  ],
  screens: {
    ...FALLBACK_INSTALLATION_CONFIG.screens,
    home: {
      ...FALLBACK_INSTALLATION_CONFIG.screens.home,
      identifier: {
        key: 'identifier',
        label: 'Identificador',
        placeholder: 'Informe o identificador',
      },
      detail: {
        sectionTitle: 'Detalhes da consulta',
        areaOfInterestSectionTitle: 'Dados da área de interesse',
        registrationDateLabel: 'Data de registro',
        alterationDateLabel: 'Data de alteração',
        latitudeLabel: 'Latitude',
        longitudeLabel: 'Longitude',
        areaLabel: 'Área',
        featuresDownloadLabel: 'Baixar feições',
      },
    },
  },
  areaOfInterest: {
    areaUnit: 'ha',
    areaUnitLabel: 'ha',
  },
}

describe('detailByIdentifier config', () => {
  it('should expose header and property field groups', () => {
    const header = getDetailFieldsByGroup('header')
    const property = getDetailFieldsByGroup('property')

    expect(header.map((field) => field.key)).toEqual([
      'id',
      'registrationDate',
      'alterationDate',
    ])
    expect(property.map((field) => field.key)).toEqual([
      'level3Name',
      'level2Name',
      'latitude',
      'longitude',
      'area',
    ])
  })

  it('should use installation hierarchy and identifier labels', () => {
    const config = buildDetailByIdentifierConfig(ptbrInstallation)
    const byKey = Object.fromEntries(config.fields.map((field) => [field.key, field.label]))

    expect(byKey.id).toBe('Identificador')
    expect(byKey.level3Name).toBe('Município')
    expect(byKey.level2Name).toBe('Estado')
    expect(byKey.registrationDate).toBe('Data de registro')
    expect(config.sectionTitle).toBe('Detalhes da consulta')
    expect(config.areaOfInterestSectionTitle).toBe('Dados da área de interesse')
  })

  it('should group property fields in rows like CP layout', () => {
    const rows = getPropertyFieldRows()

    expect(rows.map((row) => row.map((field) => field.key))).toEqual([
      ['level3Name', 'level2Name', 'latitude'],
      ['longitude', 'area'],
    ])
  })

  it('should not show centroid coordinates or fiscal modules', () => {
    const keys = detailByIdentifierConfig.fields.map((field) => field.key)
    expect(keys).not.toContain('geographicCoordinatesOfCentroid')
    expect(keys).not.toContain('fiscalModules')
  })

  it('should keep features download enabled by default', () => {
    expect(detailByIdentifierConfig.featuresDownload.enabled).toBe(true)
    expect(detailByIdentifierConfig.featuresDownload.label).toBeTruthy()
  })

  it('should include alteration date in header fields', () => {
    const header = getDetailFieldsByGroup('header')
    const alteration = header.find((field) => field.key === 'alterationDate')

    expect(alteration).toBeDefined()
    expect(alteration?.label).toBe('Alteration date')
    expect(alteration?.formatAsDate).toBe(true)
  })

  it('should use areaUnitLabel from installation config', () => {
    const config = buildDetailByIdentifierConfig({
      ...FALLBACK_INSTALLATION_CONFIG,
      areaOfInterest: {
        areaUnit: 'campos',
        areaUnitLabel: 'campos de futebol',
      },
    })
    const area = config.fields.find((field) => field.key === 'area')

    expect(area?.unitSuffix).toBe('campos de futebol')
  })

  it('should keep fallback fields when detail.fields is empty', () => {
    const config = buildDetailByIdentifierConfig({
      ...ptbrInstallation,
      screens: {
        ...ptbrInstallation.screens,
        home: {
          ...ptbrInstallation.screens.home,
          detail: {
            ...ptbrInstallation.screens.home.detail!,
            fields: [],
          },
        },
      },
    })

    expect(config.fields.map((field) => field.key)).toEqual([
      'id',
      'registrationDate',
      'alterationDate',
      'level3Name',
      'level2Name',
      'latitude',
      'longitude',
      'area',
    ])
  })

  it('should use exclusive fields in configured order', () => {
    const config = buildExclusiveConfig()

    expect(config.fields.map((field) => field.key)).toEqual([
      'id',
      'nome',
      'calculated.latitude',
    ])
    expect(config.fields.map((field) => field.label)).toEqual([
      'Identificador',
      'Property name',
      'Centroid latitude',
    ])
    expect(getDetailFieldsByGroup('header', config)).toEqual([])
    expect(getPropertyFieldRows(config).map((row) => row.map((field) => field.key))).toEqual([
      ['id', 'nome', 'calculated.latitude'],
    ])
  })

  it('should read exclusive values from attributes only', () => {
    const config = buildExclusiveConfig()
    const detail: DetailByIdentifierDTO = {
      id: 'DTO-ID',
      latitude: '-99',
      territory: {
        level2: { name: 'Distrito Federal' },
        level3: { name: 'Brasília' },
      },
      attributes: {
        id: 'ATTR-ID',
        nome: 'Sample property',
        'calculated.latitude': '-15.79',
      },
    }

    expect(readDetailFieldValue(detail, config.fields[0])).toBe('ATTR-ID')
    expect(readDetailFieldValue(detail, config.fields[1])).toBe('Sample property')
    expect(readDetailFieldValue(detail, config.fields[2])).toBe('-15.79')
    expect(config.fields.some((field) => field.key === 'level3Name')).toBe(false)
  })

  it('should format exclusive area with unit suffix and skip it for calculated.latitude', () => {
    const config = buildDetailByIdentifierConfig({
      ...ptbrInstallation,
      areaOfInterest: {
        areaUnit: 'campos',
        areaUnitLabel: 'campos de futebol',
      },
      screens: {
        ...ptbrInstallation.screens,
        home: {
          ...ptbrInstallation.screens.home,
          detail: {
            ...ptbrInstallation.screens.home.detail!,
            fields: [
              { field: 'area', label: 'Area' },
              { field: 'calculated.latitude', label: 'Centroid latitude' },
              { field: 'registration_date', label: 'Registration date' },
              { field: 'updated_at', label: 'Alteration date' },
            ],
          },
        },
      },
    })

    const area = config.fields.find((field) => field.key === 'area')
    const latitude = config.fields.find((field) => field.key === 'calculated.latitude')
    const registration = config.fields.find((field) => field.key === 'registration_date')
    const updated = config.fields.find((field) => field.key === 'updated_at')

    expect(area?.formatAsMeasure).toBe(true)
    expect(area?.unitSuffix).toBe('campos de futebol')
    expect(latitude?.formatAsMeasure).toBe(false)
    expect(latitude?.unitSuffix).toBeUndefined()
    expect(registration?.formatAsDate).toBe(true)
    expect(updated?.formatAsDate).toBe(true)
  })

  it('should format exclusive perimeter_m with two decimal places', () => {
    const config = buildDetailByIdentifierConfig({
      ...ptbrInstallation,
      screens: {
        ...ptbrInstallation.screens,
        home: {
          ...ptbrInstallation.screens.home,
          detail: {
            ...ptbrInstallation.screens.home.detail!,
            fields: [{ field: 'perimeter_m', label: 'Perímetro em metros(m)' }],
          },
        },
      },
    })

    const perimeter = config.fields.find((field) => field.key === 'perimeter_m')

    expect(perimeter?.formatAsMeasure).toBe(true)
    expect(perimeter?.unitSuffix).toBeUndefined()
  })
})

function buildExclusiveConfig() {
  return buildDetailByIdentifierConfig({
    ...ptbrInstallation,
    screens: {
      ...ptbrInstallation.screens,
      home: {
        ...ptbrInstallation.screens.home,
        detail: {
          ...ptbrInstallation.screens.home.detail!,
          fields: [
            { field: 'id', label: 'Identificador' },
            { field: 'nome', label: 'Property name' },
            { field: 'calculated.latitude', label: 'Centroid latitude' },
          ],
        },
      },
    },
  })
}
