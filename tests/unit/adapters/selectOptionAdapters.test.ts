import { describe, expect, it } from 'vitest'
import {
  territoryOptionsToSelectOptions,
  totalizersToKpis,
} from '@/adapters/selectOptionAdapters'
import { PRIMARY_KPI_CODE } from '@/config/installationConfigFallback'

describe('selectOptionAdapters', () => {
  describe('territoryOptionsToSelectOptions', () => {
    it('should map territory id and name to select option', () => {
      const result = territoryOptionsToSelectOptions([
        { id: 'DF', name: 'Distrito Federal' },
      ])

      expect(result).toEqual([{ value: 'DF', label: 'Distrito Federal' }])
    })
  })

  describe('totalizersToKpis', () => {
    it('should merge totalizer values with KPI config labels', () => {
      const result = totalizersToKpis([
        {
          name: 'Nome da API',
          code: PRIMARY_KPI_CODE,
          value: 100,
          subItemName: 'yyy',
          subItemValue: 200,
          unitOfMeasurement: 'xxx',
        },
      ])

      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result[0]).toMatchObject({
        id: PRIMARY_KPI_CODE,
        title: 'Registered properties',
        value: 100,
        unitOfMeasurement: 'un.',
        optionalLabel: 'ha',
        optionalValue: 200,
      })
      expect(result[0].accentColor).toBeTruthy()
    })

    it('should ignore empty optional subItemValue on primary card', () => {
      const result = totalizersToKpis([
        {
          name: 'Registered properties',
          code: PRIMARY_KPI_CODE,
          value: 10,
          subItemValue: 0,
          unitOfMeasurement: 'un.',
        },
      ])

      expect(result[0].optionalValue).toBeUndefined()
      expect(result[0].optionalLabel).toBeUndefined()
    })

    it('should limit to 5 KPIs from config', () => {
      const totalizers = Array.from({ length: 8 }, (_, index) => ({
        name: `KPI ${index}`,
        code: index === 0 ? PRIMARY_KPI_CODE : `EXTRA_${index}`,
        value: index,
      }))

      expect(totalizersToKpis(totalizers)).toHaveLength(5)
      expect(totalizersToKpis(totalizers)[0].id).toBe(PRIMARY_KPI_CODE)
    })
  })
})
