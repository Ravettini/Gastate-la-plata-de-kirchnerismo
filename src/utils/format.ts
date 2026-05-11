export { ARS_PER_USD } from '../data/exchange'

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Siempre pesos argentinos (el segundo argumento se ignora; queda por compatibilidad con el tipo `Currency`). */
export function formatCurrency(amount: number, _currency: 'ARS' | 'USD' = 'ARS'): string {
  return `$ ${formatNumber(amount)}`
}

export function formatCompactCount(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

export function unitPriceForCurrency(
  item: { priceARS: number; priceUSD?: number },
  _currency: 'ARS' | 'USD',
): number {
  void _currency
  return item.priceARS
}
