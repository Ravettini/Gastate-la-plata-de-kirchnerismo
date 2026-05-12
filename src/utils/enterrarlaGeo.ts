import type { GameCase, GameDifficulty } from '../data/enterrarlaTodaCases'

export type LatLng = { lat: number; lng: number }

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

export function calculateDistanceKm(pointA: LatLng, pointB: LatLng): number {
  const R = 6371
  const dLat = toRad(pointB.lat - pointA.lat)
  const dLng = toRad(pointB.lng - pointA.lng)
  const lat1 = toRad(pointA.lat)
  const lat2 = toRad(pointB.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function difficultyMultiplier(difficulty: GameDifficulty): number {
  if (difficulty === 'Fácil') return 1
  if (difficulty === 'Media') return 1.15
  return 1.3
}

/** Puntaje por ronda según distancia (km) y dificultad. */
export function calculateScore(distanceKm: number, difficulty: GameCase['difficulty']): number {
  let base = 0
  if (distanceKm <= 0.5) base = 1000
  else if (distanceKm <= 2) base = 900
  else if (distanceKm <= 5) base = 750
  else if (distanceKm <= 10) base = 600
  else if (distanceKm <= 25) base = 400
  else if (distanceKm <= 50) base = 250
  else if (distanceKm <= 100) base = 100
  else base = 0

  return Math.round(base * difficultyMultiplier(difficulty))
}

export function totalMaxPossibleScore(cases: readonly GameCase[]): number {
  return cases.reduce((s, c) => s + Math.round(1000 * difficultyMultiplier(c.difficulty)), 0)
}

export function roundResultCopy(distanceKm: number): { tone: 'excelente' | 'medio' | 'malo'; line: string } {
  if (distanceKm <= 2) {
    return { tone: 'excelente', line: 'Demasiado cerca. Sospechosamente cerca.' }
  }
  if (distanceKm <= 25) {
    return { tone: 'medio', line: 'Cerca, pero no alcanza para allanar.' }
  }
  return { tone: 'malo', line: 'Ese pozo no era.' }
}

/** Rangos según % del máximo: más puntaje = menos “kuka” en el chiste. */
export function finalRankLabel(percentOfMax: number): string {
  if (percentOfMax >= 90) return 'Anti-kuka'
  if (percentOfMax >= 70) return 'Casi anti-kuka'
  if (percentOfMax >= 50) return 'Kuka GPS'
  return 'Kuka negacionista'
}
