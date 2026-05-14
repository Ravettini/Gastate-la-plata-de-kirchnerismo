/** Sonidos retro con Web Audio API (sin archivos externos). */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  return audioCtx
}

/** Contexto compartido con música y SFX del juego góndola. */
export function getGondolaAudioContext(): AudioContext | null {
  return getCtx()
}

/** Llamar en el primer gesto del usuario (click / toque) para evitar bloqueo del navegador. */
export function unlockGondolaAudio(): void {
  const ctx = getCtx()
  if (ctx?.state === 'suspended') void ctx.resume()
}

function beep(
  freq: number,
  dur: number,
  vol = 0.07,
  type: OscillatorType = 'square',
  when = 0,
): void {
  const ctx = getCtx()
  if (!ctx) return
  const t0 = ctx.currentTime + when
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.04)
}

/** Blip estilo Undertale por letra; timbre según personaje. */
export function speakBlipForSpeaker(speaker: string): void {
  unlockGondolaAudio()
  const s = speaker.toLowerCase()

  let fLo: number
  let fHi: number
  let dur: number
  let vol: number
  let wave: OscillatorType = 'square'

  if (s.includes('carrefour')) {
    /* Empleada Carrefour: voz finita / aguda */
    fLo = 960
    fHi = 1220
    dur = 0.011
    vol = 0.022
    wave = 'sine'
  } else if (s.includes('kumpa')) {
    /* Kumpa / gordo: más grave */
    fLo = 255
    fHi = 335
    dur = 0.023
    vol = 0.065
    wave = 'triangle'
  } else if (s.includes('coto')) {
    /* Empleado COTO: grave pero menos que el Kumpa */
    fLo = 420
    fHi = 540
    dur = 0.017
    vol = 0.044
    wave = 'triangle'
  } else if (s.includes('loli') || s.includes('doña')) {
    fLo = 780
    fHi = 980
    dur = 0.012
    vol = 0.026
    wave = 'sine'
  } else {
    /* Vos, Sistema, etc. */
    fLo = 620
    fHi = 800
    dur = 0.014
    vol = 0.02
    wave = 'square'
  }

  const f = fLo + Math.random() * (fHi - fLo)
  beep(f, dur, vol, wave)
}

export const gondolaSounds = {
  /** Acierto corto (medición / arcade) */
  success: () => {
    unlockGondolaAudio()
    beep(440, 0.05, 0.06)
    beep(660, 0.07, 0.055, 'square', 0.06)
    beep(880, 0.1, 0.045, 'square', 0.12)
  },

  /** Fallo */
  fail: () => {
    unlockGondolaAudio()
    beep(140, 0.12, 0.1, 'sawtooth')
    beep(95, 0.18, 0.08, 'sawtooth', 0.1)
  },

  /** Combo / hit arcade */
  ping: () => {
    unlockGondolaAudio()
    beep(1200, 0.04, 0.04)
  },

  /** Fin de ronda de medición */
  complete: () => {
    unlockGondolaAudio()
    beep(523, 0.1, 0.06)
    beep(659, 0.1, 0.055, 'square', 0.1)
    beep(784, 0.14, 0.05, 'square', 0.2)
    beep(1046, 0.2, 0.045, 'square', 0.34)
  },

  /** Click UI / avance diálogo (muy suave) */
  ui: () => {
    unlockGondolaAudio()
    beep(880, 0.02, 0.025)
  },
}
