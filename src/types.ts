export type Currency = 'ARS' | 'USD'

export type CaseData = {
  id: string
  name: string
  shortName: string
  amount: number | null
  currency: Currency
  imageUrl: string
  amountLabel: string
  note?: string
}

export type SpendItem = {
  id: string
  name: string
  category: string
  priceARS: number
  priceUSD: number
  imageUrl: string
  description: string
}
