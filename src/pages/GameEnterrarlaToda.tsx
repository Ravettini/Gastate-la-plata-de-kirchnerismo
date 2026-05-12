import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { enterrarlaTodaCases } from '../data/enterrarlaTodaCases'
import { calculateDistanceKm, calculateScore, totalMaxPossibleScore } from '../utils/enterrarlaGeo'
import type { LatLng } from '../utils/enterrarlaGeo'
import { fixLeafletDefaultIcons } from '../lib/leafletIconFix'
import { EnterrarlaCaseCard } from '../components/enterrarla/EnterrarlaCaseCard'
import { GuessMap } from '../components/enterrarla/GuessMap'
import { RoundResult } from '../components/enterrarla/RoundResult'
import { FinalScore } from '../components/enterrarla/FinalScore'

type Phase = 'playing' | 'final'

export function GameEnterrarlaToda() {
  const maxPossible = useMemo(() => totalMaxPossibleScore(enterrarlaTodaCases), [])

  const [phase, setPhase] = useState<Phase>('playing')
  const [roundIndex, setRoundIndex] = useState(0)
  const [guess, setGuess] = useState<LatLng | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [distances, setDistances] = useState<number[]>([])
  const [closeHits, setCloseHits] = useState(0)
  const [lastRoundScore, setLastRoundScore] = useState(0)
  const [lastDistance, setLastDistance] = useState(0)
  const [confirmHint, setConfirmHint] = useState(false)

  useEffect(() => {
    fixLeafletDefaultIcons()
  }, [])

  const currentCase = enterrarlaTodaCases[roundIndex]!

  const resetGame = useCallback(() => {
    setPhase('playing')
    setRoundIndex(0)
    setGuess(null)
    setRevealed(false)
    setTotalScore(0)
    setDistances([])
    setCloseHits(0)
    setLastRoundScore(0)
    setLastDistance(0)
    setConfirmHint(false)
  }, [])

  const onPick = useCallback(
    (lat: number, lng: number) => {
      if (revealed) return
      setGuess({ lat, lng })
      setConfirmHint(false)
    },
    [revealed],
  )

  const onConfirm = () => {
    if (!guess) {
      setConfirmHint(true)
      return
    }
    const d = calculateDistanceKm(guess, {
      lat: currentCase.targetLocation.lat,
      lng: currentCase.targetLocation.lng,
    })
    const score = calculateScore(d, currentCase.difficulty)
    setLastDistance(d)
    setLastRoundScore(score)
    setTotalScore((t) => t + score)
    setDistances((arr) => [...arr, d])
    if (d <= 25) setCloseHits((c) => c + 1)
    setRevealed(true)
    setConfirmHint(false)
  }

  const onNext = () => {
    if (roundIndex >= enterrarlaTodaCases.length - 1) {
      setPhase('final')
      return
    }
    setRoundIndex((i) => i + 1)
    setGuess(null)
    setRevealed(false)
    setConfirmHint(false)
  }

  const avgDistance = distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0

  const roundLabel = `Ronda ${roundIndex + 1} / ${enterrarlaTodaCases.length}`

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F5F5F5] font-sans antialiased pb-16">
      <nav className="sticky top-0 z-50 border-b border-[#2A2F3A] bg-[#0F1115]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#A7ADB8] hover:text-[#F6C445] transition-colors"
          >
            ← Inicio
          </Link>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F6C445]/90">Minijuego</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-[0.08em] text-[#F6C445] leading-tight">
            ENTERRARLA TODA
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#A7ADB8] leading-relaxed px-2">
            Leé el expediente, mirá el mapa y marcá dónde creés que quedó enterrada la historia.
          </p>
        </header>

        {phase === 'final' ? (
          <FinalScore
            totalScore={totalScore}
            maxTotalPossible={maxPossible}
            roundCount={enterrarlaTodaCases.length}
            avgDistanceKm={avgDistance}
            closeHits={closeHits}
            onRestart={resetGame}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A7ADB8]">{roundLabel}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#22C55E] tabular-nums">
                Puntaje acumulado: {totalScore}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
              <div className="flex flex-col gap-5 min-w-0 order-2 lg:order-1">
                <EnterrarlaCaseCard gameCase={currentCase} roundLabel={roundLabel} />
                {revealed && guess ? (
                  <RoundResult
                    distanceKm={lastDistance}
                    score={lastRoundScore}
                    targetLabel={currentCase.targetLocation.label}
                    explanation={currentCase.explanation}
                  />
                ) : null}
                {confirmHint ? (
                  <p className="text-sm font-medium text-[#EF4444] text-center lg:text-left">
                    Primero marcá un lugar en el mapa.
                  </p>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!revealed ? (
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="flex-1 rounded-xl bg-[#F6C445] px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-[#0F1115] hover:bg-[#e6b63d] transition-colors"
                    >
                      Enterrar marcador
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onNext}
                      className="flex-1 rounded-xl border border-[#2A2F3A] bg-[#171A21] px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-[#F6C445] hover:border-[#F6C445]/50 transition-colors"
                    >
                      {roundIndex >= enterrarlaTodaCases.length - 1 ? 'Ver resultado final' : 'Siguiente expediente'}
                    </button>
                  )}
                </div>
              </div>

              <div className="order-1 lg:order-2 min-w-0">
                <GuessMap
                  mapKey={roundIndex}
                  mapCenter={currentCase.mapCenter}
                  target={currentCase.targetLocation}
                  guess={guess}
                  revealed={revealed}
                  interactionEnabled={!revealed}
                  onPick={onPick}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
