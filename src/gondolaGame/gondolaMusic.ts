import { getGondolaAudioContext, unlockGondolaAudio } from './gondolaSounds'

let intervalId: ReturnType<typeof setInterval> | null = null
let arcadeMode = false
let tick = 0

function playTone(
  freq: number,
  dur: number,
  vol: number,
  type: OscillatorType,
  detune = 0,
): void {
  const ctx = getGondolaAudioContext()
  if (!ctx) return
  const t0 = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  o.detune.setValueAtTime(detune, t0)
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.03)
}

function ambientHit(): void {
  const roots = [196, 220, 246.94, 261.63, 293.66, 329.63]
  const f = roots[tick % roots.length]!
  playTone(f, 0.35, 0.045, 'sine', (tick % 3) * 4 - 4)
}

function arcadeHit(): void {
  const step = tick % 8
  const bass = [65.41, 73.42, 82.41, 87.31][step % 4]!
  playTone(bass, 0.06, 0.055, 'square', 0)
  if (step % 2 === 0) {
    const hi = 330 + (tick % 5) * 55 + Math.random() * 40
    playTone(hi, 0.04, 0.035, 'square', Math.random() * 20 - 10)
  }
  if (step === 3 || step === 7) {
    playTone(880 + Math.random() * 200, 0.025, 0.028, 'sawtooth', 0)
  }
}

function tickMusic(): void {
  const ctx = getGondolaAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume()
    return
  }
  tick += 1
  if (arcadeMode) {
    arcadeHit()
  } else if (tick % 7 === 0) {
    ambientHit()
  }
}

/** Música procedural suave durante el juego (no requiere archivos). */
export function startGondolaAmbientMusic(): void {
  unlockGondolaAudio()
  if (intervalId != null) return
  tick = 0
  arcadeMode = false
  intervalId = window.setInterval(tickMusic, 48)
}

export function stopGondolaGameMusic(): void {
  if (intervalId != null) {
    window.clearInterval(intervalId)
    intervalId = null
  }
  tick = 0
}

/** Fase arcade: ritmo más frenético (misma base, más notas y más rápido). */
export function setGondolaMusicArcade(on: boolean): void {
  arcadeMode = on
}
