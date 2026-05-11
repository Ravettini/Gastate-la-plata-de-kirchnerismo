import type { CaseData } from '../types'

export const cases: CaseData[] = [
  {
    id: 'vialidad',
    name: 'Causa Vialidad / obra pública Santa Cruz',
    shortName: 'Causa Vialidad',
    amount: 756000000000,
    currency: 'ARS',
    imageUrl: '/images/vialidad.jpg',
    amountLabel: 'MONTO INVOLUCRADO APROX.',
  },
  {
    id: 'cuadernos',
    name: 'Causa Cuadernos de las coimas',
    shortName: 'Cuadernos',
    amount: 24080000000000,
    currency: 'ARS',
    imageUrl: '/images/cuadernos.jpg',
    amountLabel: 'SOBORNOS ESTIMADOS',
  },
  {
    id: 'ruta-dinero-k',
    name: 'Ruta del Dinero K / Lázaro Báez',
    shortName: 'Ruta del Dinero K',
    amount: 77000000000000,
    currency: 'ARS',
    imageUrl: '/images/ruta-dinero-k.webp',
    amountLabel: 'DECOMISO APROX.',
  },
  {
    id: 'bolsos-jose-lopez',
    name: 'Bolsos de José López',
    shortName: 'Bolsos José López',
    amount: 12572000000000,
    currency: 'ARS',
    imageUrl: '/images/bolsos-jose-lopez.jpg',
    amountLabel: 'DINERO SECUESTRADO',
  },
  {
    id: 'hotesur-los-sauces',
    name: 'Hotesur / Los Sauces',
    shortName: 'Hotesur / Los Sauces',
    amount: 800000000,
    currency: 'ARS',
    imageUrl: '/images/hotesur.jpg',
    amountLabel: 'EMBARGO APROX.',
  },
  {
    id: 'massa-2023',
    name: 'Campaña presidencial Massa / Unión por la Patria 2023',
    shortName: 'Massa 2023',
    amount: 2168751732,
    currency: 'ARS',
    imageUrl: '/images/massa-2023.jpg',
    amountLabel: 'GASTO DECLARADO APROX.',
  },
  {
    id: 'pauta-pba',
    name: 'Pauta publicitaria oficial PBA desde 2023',
    shortName: 'Pauta PBA',
    amount: 82000000000,
    currency: 'ARS',
    imageUrl: '/images/pauta-pba.jpg',
    amountLabel: 'PAUTA RELEVADA 2024-2025',
  },
]

export function getCaseById(id: string): CaseData | undefined {
  return cases.find((c) => c.id === id)
}
