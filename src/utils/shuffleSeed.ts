/** FNV-1a 32-bit: semilla estable a partir de texto. */
export function hashString32(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Barajado de Fisher–Yates con PRNG LCG determinista. */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice()
  let s = seed || 1
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = out[i]!
    out[i] = out[j]!
    out[j] = t
  }
  return out
}
