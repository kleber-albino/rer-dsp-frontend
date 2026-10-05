import { describe, expect, it } from 'vitest'
import { MAX_HOME_KPIS, resolveHomeKpis } from '@/config/homeKpis'
import {
  FALLBACK_INSTALLATION_CONFIG,
  PRIMARY_KPI_CODE,
} from '@/config/installationConfigFallback'
import type { HomeKpisConfig } from '@/types/installationConfig'
import type { TotalizerDTO } from '@/types/totalizer'

const sampleTotalizers: TotalizerDTO[] = [
  {
    code: PRIMARY_KPI_CODE,
    name: 'Registered properties',
    value: 10,
    unitOfMeasurement: 'un.',
    subItemName: 'ha',
    subItemValue: 20,
  },
  { code: 'THEME_1', name: 'Theme 1', value: 1, unitOfMeasurement: 'ha' },
  { code: 'THEME_2', name: 'Theme 2', value: 2, unitOfMeasurement: 'ha' },
  { code: 'THEME_3', name: 'Theme 3', value: 3, unitOfMeasurement: 'ha' },
  { code: 'THEME_4', name: 'Theme 4', value: 4, unitOfMeasurement: 'ha' },
]

describe('homeKpis', () => {
  describe('resolveHomeKpis', () => {
    it('should return empty array when primary card is missing from config', () => {
      const config: HomeKpisConfig = {
        maxCards: 5,
        primaryCode: PRIMARY_KPI_CODE,
        cards: [
          {
            code: 'OTHER',
            label: 'Other',
            accentColor: '#000',
            order: 1,
          },
        ],
      }

      expect(resolveHomeKpis(sampleTotalizers, config)).toEqual([])
    })

    it('should keep up to MAX_HOME_KPIS items and put primary first', () => {
      const result = resolveHomeKpis(sampleTotalizers, FALLBACK_INSTALLATION_CONFIG.kpis)

      expect(result.length).toBeLessThanOrEqual(MAX_HOME_KPIS)
      expect(result[0].id).toBe(PRIMARY_KPI_CODE)
      expect(result[0].title).toBe('Registered properties')
    })

    it('should force primary card to first position even when order is wrong', () => {
      const config: HomeKpisConfig = {
        maxCards: 5,
        primaryCode: PRIMARY_KPI_CODE,
        cards: [
          {
            code: 'THEME_1',
            label: 'Theme 1',
            unitOfMeasurement: 'ha',
            accentColor: '#C1D2F2',
            order: 1,
          },
          {
            code: PRIMARY_KPI_CODE,
            label: 'Registered properties',
            unitOfMeasurement: 'un.',
            optionalLabel: 'ha',
            accentColor: '#CED6E5',
            order: 9,
            required: true,
          },
        ],
      }

      const result = resolveHomeKpis(sampleTotalizers, config)

      expect(result[0].id).toBe(PRIMARY_KPI_CODE)
      expect(result[1].id).toBe('THEME_1')
    })

    it('should truncate when there are more than 5 configured cards', () => {
      const config: HomeKpisConfig = {
        maxCards: 5,
        primaryCode: PRIMARY_KPI_CODE,
        cards: [
          {
            code: PRIMARY_KPI_CODE,
            label: 'Registered properties',
            accentColor: '#CED6E5',
            order: 1,
            required: true,
          },
          ...Array.from({ length: 6 }, (_, index) => ({
            code: `EXTRA_${index}`,
            label: `Extra ${index}`,
            accentColor: '#000',
            order: index + 2,
          })),
        ],
      }

      const totalizers: TotalizerDTO[] = [
        { code: PRIMARY_KPI_CODE, name: 'Registered properties', value: 10 },
        ...Array.from({ length: 6 }, (_, index) => ({
          code: `EXTRA_${index}`,
          name: `Extra ${index}`,
          value: index,
        })),
      ]

      const result = resolveHomeKpis(totalizers, config)
      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(PRIMARY_KPI_CODE)
    })

    it('should use labels and units from config, not from totalizer payload', () => {
      const totalizers: TotalizerDTO[] = [
        {
          code: PRIMARY_KPI_CODE,
          name: 'Nome vindo da API',
          value: 99,
          unitOfMeasurement: 'xxx',
          subItemName: 'yyy',
          subItemValue: 12,
        },
      ]

      const result = resolveHomeKpis(totalizers, FALLBACK_INSTALLATION_CONFIG.kpis)

      expect(result[0].title).toBe('Registered properties')
      expect(result[0].unitOfMeasurement).toBe('un.')
      expect(result[0].optionalLabel).toBe('ha')
      expect(result[0].value).toBe(99)
      expect(result[0].optionalValue).toBe(12)
    })
  })
})
