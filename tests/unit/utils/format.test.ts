import { describe, expect, it } from 'vitest'
import { formatPropertyMeasures, formatValue, formatValueInt } from '@/utils/format'

describe('format', () => {
  describe('formatValue', () => {
    it('should return dash for empty values', () => {
      expect(formatValue(null)).toBe('—')
      expect(formatValue(undefined)).toBe('—')
      expect(formatValue('')).toBe('—')
    })

    it('should format numbers with en-US separators', () => {
      expect(formatValue(128450)).toBe('128,450')
      expect(formatValue(2456789.5)).toBe('2,456,789.5')
    })

    it('should return original string when not numeric', () => {
      expect(formatValue('abc')).toBe('abc')
    })
  })

  describe('formatValueInt', () => {
    it('should return dash for empty values', () => {
      expect(formatValueInt(null)).toBe('—')
      expect(formatValueInt(undefined)).toBe('—')
    })

    it('should format as integer without decimals', () => {
      expect(formatValueInt(128450.7)).toBe('128,451')
      expect(formatValueInt(42)).toBe('42')
    })
  })

  describe('formatPropertyMeasures', () => {
    it('should format with dot decimals and no thousands separator', () => {
      expect(formatPropertyMeasures(120.5)).toBe('120.50')
      expect(formatPropertyMeasures('2,5')).toBe('2.50')
      expect(formatPropertyMeasures(53944.7195802754)).toBe('53944.72')
    })

    it('should return dash for invalid values', () => {
      expect(formatPropertyMeasures(null)).toBe('—')
      expect(formatPropertyMeasures('abc')).toBe('—')
    })
  })
})
