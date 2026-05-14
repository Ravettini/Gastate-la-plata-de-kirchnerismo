import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ASSETS, type StoreId } from './assetUrls'
import { STORES } from './storesData'
import { DialoguePanel } from './DialoguePanel'
import { MeasurementGame } from './MeasurementGame'
import {
  employeeBranchLines,
  employeeOpening,
  finalKumpaLines,
  introLines,
  rubbleInterludeText,
} from './gameScripts'
import './gondolaGame.css'
import { startGondolaAmbientMusic, stopGondolaGameMusic } from './gondolaMusic'
import { unlockGondolaAudio } from './gondolaSounds'

const LS_KEY = 'gondolaMetro_v1'

type Persist = {
  completedStores: Record<StoreId, boolean>
  scores: Record<StoreId, number>
}

const initialPersist: Persist = {
  completedStores: { coto: false, carrefour: false, almacen: false },
  scores: { coto: 0, carrefour: 0, almacen: 0 },
}

type View =
  | { id: 'intro'; showMetroBtn: boolean }
  | { id: 'map' }
  | { id: 'store_opening'; store: StoreId }
  | { id: 'store_choice'; store: StoreId }
  | { id: 'store_branch'; store: StoreId; branch: 'normal' | 'agresivo'; lineIdx: number }
  | { id: 'rubble' }
  | { id: 'pregame'; store: StoreId }
  | { id: 'minigame'; store: StoreId }
  | { id: 'results'; store: StoreId; score: number; accuracy: number; rank: string }
  | { id: 'final_kumpa'; lineIdx: number }
  | { id: 'final_beaten' }

function stageBg(view: View, storeId: StoreId | null): string | null {
  if (view.id === 'intro') return ASSETS.intro
  if (view.id === 'map') return null
  if (view.id === 'store_opening' || view.id === 'store_choice' || view.id === 'store_branch' || view.id === 'pregame') {
    return STORES[view.store].employeeImage
  }
  if (view.id === 'results' && storeId) return STORES[storeId].image
  if (view.id === 'final_kumpa') return ASSETS.finalKumpa
  if (view.id === 'final_beaten') return ASSETS.finalBeaten
  return null
}

export function GondolaGame() {
  const [persist, setPersist] = useState<Persist>(initialPersist)
  const [view, setView] = useState<View>({ id: 'intro', showMetroBtn: false })
  const musicStartedRef = useRef(false)

  useEffect(() => {
    return () => {
      stopGondolaGameMusic()
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const p = JSON.parse(raw) as Partial<Persist>
      setPersist({
        completedStores: { ...initialPersist.completedStores, ...p.completedStores },
        scores: { ...initialPersist.scores, ...p.scores },
      })
    } catch {
      /* */
    }
  }, [])

  const savePersist = useCallback((updater: (prev: Persist) => Persist) => {
    setPersist((prev) => {
      const next = updater(prev)
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch {
        /* */
      }
      return next
    })
  }, [])

  const introLine = introLines()[0]!
  const finalLines = finalKumpaLines()
  const allDone =
    persist.completedStores.coto && persist.completedStores.carrefour && persist.completedStores.almacen

  const resetAll = useCallback(() => {
    musicStartedRef.current = false
    stopGondolaGameMusic()
    savePersist(() => initialPersist)
    setView({ id: 'intro', showMetroBtn: false })
  }, [savePersist])

  const goMap = useCallback(() => setView({ id: 'map' }), [])

  const skipNarrative = useCallback(() => {
    if (view.id === 'intro') {
      goMap()
      return
    }
    if (
      view.id === 'store_opening' ||
      view.id === 'store_choice' ||
      view.id === 'store_branch'
    ) {
      setView({ id: 'pregame', store: view.store })
      return
    }
    if (view.id === 'rubble') {
      setView({ id: 'pregame', store: 'almacen' })
      return
    }
    if (view.id === 'pregame') {
      setView({ id: 'minigame', store: view.store })
      return
    }
    if (view.id === 'final_kumpa') {
      setView({ id: 'final_beaten' })
    }
  }, [goMap, view])

  const resultStore = view.id === 'results' ? view.store : null
  const bg = stageBg(view, resultStore)

  const tapeCursor: CSSProperties | undefined =
    view.id === 'minigame'
      ? { cursor: `url("${ASSETS.tapeMeasure}") 8 8, crosshair` }
      : undefined

  const onAudioBoot = useCallback(() => {
    unlockGondolaAudio()
    if (!musicStartedRef.current) {
      musicStartedRef.current = true
      startGondolaAmbientMusic()
    }
  }, [])

  return (
    <div className="gondola-root" onPointerDownCapture={onAudioBoot}>
      <div className="gondola-top-bar">
        <button type="button" className="gondola-link-btn" onClick={skipNarrative}>
          SKIP
        </button>
        <button type="button" className="gondola-link-btn" onClick={resetAll}>
          Reiniciar progreso
        </button>
      </div>

      <div className="gondola-main-col">
        <div className="gondola-stage-wrap" style={tapeCursor}>
          {view.id === 'map' ? (
            <>
              <div className="gondola-title-map">Elegí el supermercado al que vas a entrar:</div>
              <div className="gondola-map-grid">
                {(['coto', 'carrefour', 'almacen'] as const).map((id) => {
                  const st = STORES[id]
                  const done = persist.completedStores[id]
                  return (
                    <button
                      key={id}
                      type="button"
                      className="gondola-card"
                      disabled={done}
                      onClick={() => {
                        if (done) return
                        setView({ id: 'store_opening', store: id })
                      }}
                    >
                      <img className="pixelated" src={st.image} alt="" />
                      <div>{st.name}</div>
                      <div className="tag">{done ? '✓ Medido' : 'Pendiente'}</div>
                    </button>
                  )
                })}
              </div>
              {allDone ? (
                <div className="gondola-map-footer">
                  <button
                    type="button"
                    className="gondola-btn"
                    onClick={() => setView({ id: 'final_kumpa', lineIdx: 0 })}
                  >
                    VOLVER CON EL KUMPA
                  </button>
                </div>
              ) : null}
              <p className="gondola-stage-hint">
                Completá los tres supermercados para volver con el Kumpa. Cada uno se juega una sola vez.
              </p>
            </>
          ) : view.id === 'minigame' ? (
            <MeasurementGame
              key={view.store}
              storeName={STORES[view.store].name}
              showHowToPlay={
                !persist.completedStores.coto &&
                !persist.completedStores.carrefour &&
                !persist.completedStores.almacen
              }
              onComplete={(score, accuracyPct, rank) => {
                const id = view.store
                savePersist((prev) => ({
                  ...prev,
                  completedStores: { ...prev.completedStores, [id]: true },
                  scores: { ...prev.scores, [id]: score },
                }))
                setView({ id: 'results', store: id, score, accuracy: accuracyPct, rank })
              }}
            />
          ) : view.id === 'rubble' ? (
            <div className="gondola-blackout">
              <p style={{ whiteSpace: 'pre-wrap' }}>{rubbleInterludeText}</p>
              <button
                type="button"
                className="gondola-btn"
                style={{ marginTop: 20 }}
                onClick={() => setView({ id: 'pregame', store: 'almacen' })}
              >
                MEDIR LOS ESCOMBROS
              </button>
            </div>
          ) : bg ? (
            <>
              <img className="pixelated" src={bg} alt="" draggable={false} />
              <div className="gondola-scanlines" aria-hidden />
            </>
          ) : (
            <div
              className="gondola-scanlines"
              aria-hidden
              style={{ background: '#15151a', width: '100%', height: '100%' }}
            />
          )}
        </div>

        {view.id === 'intro' ? (
          <DialoguePanel
            speaker={introLine.speaker}
            text={introLine.text}
            onTypingComplete={() => setView({ id: 'intro', showMetroBtn: true })}
            extraButtons={
              view.showMetroBtn
                ? [{ label: 'AGARRAR EL METRO', onClick: () => setView({ id: 'map' }) }]
                : undefined
            }
          />
        ) : null}

        {view.id === 'store_opening' ? (
          <DialoguePanel
            speaker={employeeOpening(view.store).speaker}
            text={employeeOpening(view.store).text}
            onAdvance={() => setView({ id: 'store_choice', store: view.store })}
          />
        ) : null}

        {view.id === 'store_choice' ? (
          <DialoguePanel
            speaker="Vos"
            text="¿Cómo le respondés?"
            choices={[
              { id: 'normal', label: 'NORMAL' },
              { id: 'agresivo', label: 'AGRESIVO' },
            ]}
            onPickChoice={(id) =>
              setView({
                id: 'store_branch',
                store: view.store,
                branch: id === 'agresivo' ? 'agresivo' : 'normal',
                lineIdx: 0,
              })
            }
          />
        ) : null}

        {view.id === 'store_branch' ? (
          <BranchDialogue
            store={view.store}
            branch={view.branch}
            lineIdx={view.lineIdx}
            onLineIdx={(i) =>
              setView((v) => (v.id === 'store_branch' ? { ...v, lineIdx: i } : v))
            }
            onDone={() => {
              setView((v) => {
                if (v.id !== 'store_branch') return v
                if (v.store === 'almacen' && v.branch === 'agresivo') return { id: 'rubble' }
                return { id: 'pregame', store: v.store }
              })
            }}
          />
        ) : null}

        {view.id === 'pregame' ? (
          <DialoguePanel
            speaker="Sistema"
            text={`Preparate para la medición popular de la góndola.

El metro ya está calibrado ideológicamente.`}
            extraButtons={[
              { label: 'EMPEZAR MEDICIÓN', onClick: () => setView({ id: 'minigame', store: view.store }) },
            ]}
          />
        ) : null}

        {view.id === 'results' ? (
          <div className="gondola-dialog">
            <div className="gondola-speaker">Góndola medida</div>
            <div className="gondola-text" style={{ marginBottom: 12 }}>
              {STORES[view.store].resultText}
            </div>
            <div className="gondola-text" style={{ fontSize: 13, marginBottom: 16 }}>
              Puntaje: {view.score}
              {'\n'}
              Precisión: {view.accuracy}%
              {'\n'}
              Rango militante: {view.rank}
            </div>
            <div className="gondola-btn-row">
              <button type="button" className="gondola-btn" onClick={() => setView({ id: 'map' })}>
                VOLVER AL MAPA
              </button>
            </div>
          </div>
        ) : null}

        {view.id === 'final_kumpa' ? (
          <DialoguePanel
            speaker={finalLines[view.lineIdx]!.speaker}
            text={finalLines[view.lineIdx]!.text}
            onAdvance={() => {
              if (view.lineIdx >= finalLines.length - 1) setView({ id: 'final_beaten' })
              else setView({ id: 'final_kumpa', lineIdx: view.lineIdx + 1 })
            }}
          />
        ) : null}

        {view.id === 'final_beaten' ? (
          <div className="gondola-dialog">
            <div className="gondola-speaker" style={{ color: '#ffeb3b' }}>
              FIN
            </div>
            <div className="gondola-text" style={{ marginBottom: 16 }}>
              La góndola fue medida.
              {'\n'}
              El usuario también.
            </div>
            <button type="button" className="gondola-btn" onClick={resetAll}>
              JUGAR DE NUEVO
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BranchDialogue({
  store,
  branch,
  lineIdx,
  onLineIdx,
  onDone,
}: {
  store: StoreId
  branch: 'normal' | 'agresivo'
  lineIdx: number
  onLineIdx: (n: number) => void
  onDone: () => void
}) {
  const lines = employeeBranchLines(store, branch)
  const line = lines[lineIdx]!
  return (
    <DialoguePanel
      speaker={line.speaker}
      text={line.text}
      onAdvance={() => {
        if (lineIdx < lines.length - 1) onLineIdx(lineIdx + 1)
        else onDone()
      }}
    />
  )
}
