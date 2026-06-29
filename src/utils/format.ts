export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
