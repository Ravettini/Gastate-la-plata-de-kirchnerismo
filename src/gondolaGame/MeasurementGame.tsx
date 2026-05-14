import { useCallback, useEffect, useRef, useState } from 'react'
import { ASSETS } from './assetUrls'
import { setGondolaMusicArcade } from './gondolaMusic'
import { gondolaSounds, unlockGondolaAudio } from './gondolaSounds'

const FLOAT_GOOD = [
  'WOW!',
  'OMG!',
  'GÓNDOLA DOMADA!',
  'MEDICIÓN POPULAR!',
  'KUMPA PERFECT!',
  'NÉSTOR APRUEBA',
  'LA GÓNDOLA ES DEL PUEBLO',
]

const FLOAT_BAD = ['UH, GATO…', 'MEDICIÓN FLOJA', 'MACRI TE DESVIÓ EL METRO', 'VOLVÉ A INTENTAR, KUMPA']

export function rankFromScore(score: number): string {
  if (score >= 3500) return 'Kumpa legendario'
  if (score >= 2800) return 'Héroe nacional de la medición'
  if (score >= 2100) return 'Comisario de precios'
  if (score >= 1500) return 'Delegado del metro'
  if (score >= 900) return 'Inspector de pasillo'
  return 'Becario de góndola'
}

type Phase = 'width' | 'height' | 'arcade' | 'done'

type Line = { x1: number; y1: number; x2: number; y2: number; vx: number; vy: number; id: number; hit?: boolean }

type Props = {
  storeName: string
  /** Primera vez que jugás el minijuego en esta partida: muestra cómo funciona. */
  showHowToPlay?: boolean
  onComplete: (score: number, accuracyPct: number, rank: string) => void
}

type FloatMsg = { text: string; kind: 'good' | 'bad' }

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  alpha: number,
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return
  const scale = Math.min(cw / iw, ch / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2
  ctx.save()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#07060a'
  ctx.fillRect(0, 0, cw, ch)
  ctx.globalAlpha = alpha
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

function strokeNeonLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  accent: string,
) {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(0,0,0,0.92)'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.lineWidth = 5
  ctx.strokeStyle = '#ffffff'
  ctx.shadowColor = accent
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.lineWidth = 2.5
  ctx.strokeStyle = accent
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

export function MeasurementGame({ storeName, showHowToPlay = false, onComplete }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLImageElement | null>(null)
  const [phase, setPhase] = useState<Phase>('width')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [accuracySum, setAccuracySum] = useState(0)
  const [accuracyN, setAccuracyN] = useState(0)
  const [timeLeft, setTimeLeft] = useState(38)
  const [msg, setMsg] = useState<FloatMsg | null>(null)
  const [howToOpen, setHowToOpen] = useState(!!showHowToPlay)
  const [flash, setFlash] = useState(false)
  const [shake, setShake] = useState(false)
  const scoreRef = useRef(0)
  const accSumRef = useRef(0)
  const accNRef = useRef(0)
  useEffect(() => {
    scoreRef.current = score
  }, [score])
  useEffect(() => {
    accSumRef.current = accuracySum
    accNRef.current = accuracyN
  }, [accuracySum, accuracyN])
  const linesRef = useRef<Line[]>([])
  const dragRef = useRef<{ active: boolean; x0: number; y0: number; x1: number; y1: number } | null>(null)
  const idealRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const phaseRef = useRef<Phase>('width')
  const arcadeEndRef = useRef(0)
  const idRef = useRef(0)
  const rafRef = useRef(0)
  const closingPhaseRef = useRef<Phase>('width')

  const pushFloat = useCallback((good: boolean) => {
    const pool = good ? FLOAT_GOOD : FLOAT_BAD
    const text = pool[Math.floor(Math.random() * pool.length)]!
    setMsg({ text, kind: good ? 'good' : 'bad' })
    if (good) {
      gondolaSounds.success()
    } else {
      gondolaSounds.fail()
    }
    window.setTimeout(() => setMsg(null), good ? 3000 : 4500)
  }, [])

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    const w = wrapRef.current?.clientWidth || 800
    const h = wrapRef.current?.clientHeight || 450
    if (!ctx || !c) return
    const ph = phaseRef.current
    ctx.save()
    ctx.clearRect(0, 0, w, h)
    const bg = bgRef.current
    if (bg?.complete && bg.naturalWidth) {
      drawImageContain(ctx, bg, w, h, 0.98)
    } else {
      ctx.fillStyle = '#1a1510'
      ctx.fillRect(0, 0, w, h)
    }
    const ideal = idealRef.current
    if ((ph === 'width' || ph === 'height') && ideal) {
      strokeNeonLine(ctx, ideal.x1, ideal.y1, ideal.x2, ideal.y2, '#00f5ff')
    }
    const drag = dragRef.current
    if (drag?.active) {
      strokeNeonLine(ctx, drag.x0, drag.y0, drag.x1, drag.y1, '#7cff7c')
    } else if (drag && !drag.active && (ph === 'width' || ph === 'height')) {
      strokeNeonLine(ctx, drag.x0, drag.y0, drag.x1, drag.y1, '#ff4b9a')
    }
    if (ph === 'arcade') {
      for (const ln of linesRef.current) {
        if (ln.hit) continue
        strokeNeonLine(ctx, ln.x1, ln.y1, ln.x2, ln.y2, '#ff00ff')
      }
    }
    ctx.restore()
  }, [])

  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current
    const w = wrapRef.current
    if (!c || !w) return
    const r = w.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.floor(r.width * dpr)
    c.height = Math.floor(r.height * dpr)
    c.style.width = `${r.width}px`
    c.style.height = `${r.height}px`
    const ctx = c.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [])

  useEffect(() => {
    if (!bgRef.current) {
      const im = new Image()
      im.src = ASSETS.gondolaPixel
      im.onload = () => draw()
      bgRef.current = im
    }
    resizeCanvas()
    const ro = new ResizeObserver(() => resizeCanvas())
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [resizeCanvas, draw])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    setGondolaMusicArcade(phase === 'arcade')
    return () => setGondolaMusicArcade(false)
  }, [phase])

  useEffect(() => {
    draw()
  }, [draw, phase, msg])

  const setupWidthPhase = useCallback(() => {
    const w = wrapRef.current?.clientWidth || 800
    const h = wrapRef.current?.clientHeight || 450
    idealRef.current = { x1: w * 0.12, y1: h * 0.48, x2: w * 0.88, y2: h * 0.48 }
    dragRef.current = null
  }, [])

  const setupHeightPhase = useCallback(() => {
    const w = wrapRef.current?.clientWidth || 800
    const h = wrapRef.current?.clientHeight || 450
    idealRef.current = { x1: w * 0.5, y1: h * 0.18, x2: w * 0.5, y2: h * 0.78 }
    dragRef.current = null
  }, [])

  useEffect(() => {
    if (phase === 'width') setupWidthPhase()
    if (phase === 'height') setupHeightPhase()
    if (phase === 'arcade') {
      linesRef.current = []
      arcadeEndRef.current = performance.now() + 38000
      setTimeLeft(38)
    }
    draw()
  }, [phase, setupWidthPhase, setupHeightPhase, draw])

  const distPointSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    let t = ((px - x1) * dx + (py - y1) * dy) / (len * len)
    t = Math.max(0, Math.min(1, t))
    const qx = x1 + t * dx
    const qy = y1 + t * dy
    return Math.hypot(px - qx, py - qy)
  }

  const finishDrag = () => {
    const ideal = idealRef.current
    const drag = dragRef.current
    const donePhase = closingPhaseRef.current
    if (!ideal || !drag) return
    const d1 = Math.hypot(drag.x0 - ideal.x1, drag.y0 - ideal.y1)
    const d2 = Math.hypot(drag.x1 - ideal.x2, drag.y1 - ideal.y2)
    const lenIdeal = Math.hypot(ideal.x2 - ideal.x1, ideal.y2 - ideal.y1)
    const lenUser = Math.hypot(drag.x1 - drag.x0, drag.y1 - drag.y0)
    const lenErr = Math.abs(lenUser - lenIdeal) / Math.max(lenIdeal, 1)
    const endErr = (d1 + d2) / 2
    const good = endErr < Math.max(38, lenIdeal * 0.12) && lenErr < 0.35
    setAccuracySum((s) => {
      const v = s + (good ? 92 : 35)
      accSumRef.current = v
      return v
    })
    setAccuracyN((n) => {
      const v = n + 1
      accNRef.current = v
      return v
    })
    if (good) {
      const pts = 400 + Math.floor(Math.random() * 200)
      setScore((s) => {
        const v = s + pts
        scoreRef.current = v
        return v
      })
      setCombo((c) => c + 1)
      setFlash(true)
      window.setTimeout(() => setFlash(false), 220)
      pushFloat(true)
    } else {
      setCombo(0)
      setShake(true)
      window.setTimeout(() => setShake(false), 350)
      pushFloat(false)
    }
    dragRef.current = { ...drag, active: false }
    draw()
    window.setTimeout(() => {
      if (donePhase === 'width') setPhase('height')
      else if (donePhase === 'height') setPhase('arcade')
    }, 650)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'width' && phase !== 'height') return
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    closingPhaseRef.current = phase
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    dragRef.current = { active: true, x0: x, y0: y, x1: x, y1: y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag?.active) return
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    drag.x1 = e.clientX - r.left
    drag.y1 = e.clientY - r.top
    draw()
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag?.active) return
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* */
    }
    finishDrag()
  }

  const spawnLine = (w: number, h: number) => {
    const t = Math.random()
    let x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0,
      vx = 0,
      vy = 0
    if (t < 0.34) {
      x1 = x2 = Math.random() * w
      y1 = -40
      y2 = h * 0.28
      vy = 88 + Math.random() * 92
    } else if (t < 0.67) {
      x1 = -50
      y1 = y2 = Math.random() * h * 0.82
      x2 = w * 0.32
      vx = 72 + Math.random() * 84
    } else {
      x1 = w + 50
      y1 = y2 = Math.random() * h * 0.82
      x2 = w * 0.68
      vx = -(72 + Math.random() * 84)
    }
    linesRef.current.push({ x1, y1, x2, y2, vx, vy, id: ++idRef.current })
  }

  useEffect(() => {
    if (phase !== 'arcade') return
    let last = performance.now()
    let acc = 0
    const loop = (now: number) => {
      const w = wrapRef.current?.clientWidth || 800
      const h = wrapRef.current?.clientHeight || 450
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      acc += dt
      if (acc > 0.55) {
        acc = 0
        spawnLine(w, h)
      }
      setTimeLeft(Math.ceil(Math.max(0, (arcadeEndRef.current - now) / 1000)))
      for (const ln of linesRef.current) {
        if (ln.hit) continue
        ln.x1 += ln.vx * dt
        ln.x2 += ln.vx * dt
        ln.y1 += ln.vy * dt
        ln.y2 += ln.vy * dt
      }
      linesRef.current = linesRef.current.filter((ln) => {
        if (ln.hit) return false
        const cx = (ln.x1 + ln.x2) / 2
        const cy = (ln.y1 + ln.y2) / 2
        return cx > -140 && cx < w + 140 && cy > -140 && cy < h + 140
      })
      draw()
      if (now < arcadeEndRef.current) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        setPhase('done')
        const n = accNRef.current
        const s = accSumRef.current
        const pct = n > 0 ? Math.round(s / n) : 0
        const sc = scoreRef.current
        window.setTimeout(() => {
          gondolaSounds.complete()
          onComplete(sc, pct, rankFromScore(sc))
        }, 400)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, draw, onComplete])

  const onArcadeClick = (e: React.PointerEvent) => {
    if (phase !== 'arcade') return
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    let hitAny = false
    for (const ln of linesRef.current) {
      if (ln.hit) continue
      const d = distPointSeg(px, py, ln.x1, ln.y1, ln.x2, ln.y2)
      if (d < 20) {
        ln.hit = true
        hitAny = true
        const pts = 120 + combo * 40
        setScore((s) => {
          const v = s + pts
          scoreRef.current = v
          return v
        })
        setCombo((c) => c + 1)
        setAccuracySum((s) => {
          const v = s + Math.max(40, 100 - Math.floor(d * 2))
          accSumRef.current = v
          return v
        })
        setAccuracyN((n) => {
          const v = n + 1
          accNRef.current = v
          return v
        })
        setFlash(true)
        window.setTimeout(() => setFlash(false), 160)
        pushFloat(true)
        break
      }
    }
    if (!hitAny) {
      const lostCombo = combo
      setCombo(0)
      const penalty = Math.min(110, 42 + lostCombo * 18)
      setScore((s) => {
        const v = Math.max(0, s - penalty)
        scoreRef.current = v
        return v
      })
      setAccuracySum((s) => {
        const v = s + 22
        accSumRef.current = v
        return v
      })
      setAccuracyN((n) => {
        const v = n + 1
        accNRef.current = v
        return v
      })
      setShake(true)
      window.setTimeout(() => setShake(false), 280)
      pushFloat(false)
    }
    draw()
  }

  const onWrapPointerDown = (e: React.PointerEvent) => {
    if (howToOpen) return
    unlockGondolaAudio()
    if (phase === 'arcade') onArcadeClick(e)
    else onPointerDown(e)
  }

  return (
    <div
      ref={wrapRef}
      className={`gondola-canvas-wrap ${shake ? 'gondola-shake' : ''} ${flash ? 'gondola-flash' : ''}`}
      onPointerDown={onWrapPointerDown}
      onPointerMove={!howToOpen && (phase === 'width' || phase === 'height') ? onPointerMove : undefined}
      onPointerUp={!howToOpen && (phase === 'width' || phase === 'height') ? onPointerUp : undefined}
    >
      <canvas ref={canvasRef} />
      <div className="gondola-hud gondola-hud--neon">
        <span>{storeName}</span>
        <span>Pts: {score}</span>
        <span>Tiempo: {phase === 'arcade' ? `${timeLeft}s` : '—'}</span>
        <span>Combo: x{combo}</span>
        <span>
          Fase:{' '}
          {howToOpen
            ? 'Instrucciones'
            : phase === 'width'
              ? 'Ancho'
              : phase === 'height'
                ? 'Alto'
                : phase === 'arcade'
                  ? 'Arcade'
                  : 'Fin'}
        </span>
      </div>
      {howToOpen ? (
        <div className="gondola-howto-overlay" role="dialog" aria-labelledby="gondola-howto-title">
          <h2 id="gondola-howto-title" className="gondola-howto-title">
            Cómo funciona el metro popular
          </h2>
          <div className="gondola-howto-body">
            <p>
              <strong>1 — Ancho:</strong> aparece una línea guía horizontal (cyan). Hacé click y arrastrá sin soltar
              siguiendo esa línea, y soltá al final. Cuanto más pegado a la guía, mejor medición.
            </p>
            <p>
              <strong>2 — Alto:</strong> lo mismo pero con una línea vertical. Otra vez: arrastrá desde el inicio al
              final de la guía y soltá.
            </p>
            <p>
              <strong>3 — Arcade:</strong> entran líneas neón que se mueven por la pantalla. Tocá o hacé click cerca de
              cada línea cuando pase para &quot;medirla&quot; antes de que se vaya. Sumás combo si encadenás aciertos.
              Tenés tiempo limitado.
            </p>
            <p className="gondola-howto-tip">Tip: en desktop usá el mouse; en celular, tocá directo sobre la línea.</p>
          </div>
          <button
            type="button"
            className="gondola-btn gondola-howto-btn"
            onClick={() => {
              unlockGondolaAudio()
              gondolaSounds.ui()
              setHowToOpen(false)
            }}
          >
            LISTO, A MEDIR
          </button>
        </div>
      ) : null}
      {msg ? (
        <div
          className={`gondola-float gondola-float--${msg.kind}`}
          style={{ left: '50%', top: '34%', transform: 'translateX(-50%)' }}
        >
          {msg.text}
        </div>
      ) : null}
      {phase === 'width' || phase === 'height' ? (
        <p className="gondola-measure-hint">Arrastrá siguiendo la línea guía (borde negro + cyan) y soltá.</p>
      ) : null}
    </div>
  )
}
