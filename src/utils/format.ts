export function formatValue(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(numeric)
}

export function formatValueInt(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(numeric)
}

export function formatPropertyMeasures(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  const normalized = typeof value === 'string' ? value.replace(',', '.') : value
  const numeric = typeof normalized === 'number' ? normalized : Number(normalized)
  if (Number.isNaN(numeric)) {
    return '—'
  }

  return numeric.toFixed(2)
}
