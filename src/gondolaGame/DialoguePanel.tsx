import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gondolaSounds, speakBlipForSpeaker, unlockGondolaAudio } from './gondolaSounds'

type Choice = { id: string; label: string }

type Props = {
  speaker: string
  text: string
  /** Si hay opciones, se muestran cuando el texto llegó al final */
  choices?: Choice[]
  onPickChoice?: (id: string) => void
  extraButtons?: { label: string; onClick: () => void }[]
  /** Click / tecla cuando el texto ya está completo y no hay choices (o para completar texto) */
  onAdvance?: () => void
  /** Se dispara una vez cuando el typewriter llega al final (natural o por skip) */
  onTypingComplete?: () => void
}

export function DialoguePanel({
  speaker,
  text,
  choices,
  onPickChoice,
  extraButtons,
  onAdvance,
  onTypingComplete,
}: Props) {
  const normalized = useMemo(() => text.replace(/\\n/g, '\n'), [text])
  const [len, setLen] = useState(0)
  const full = len >= normalized.length
  const reportedRef = useRef<string>('')

  useEffect(() => {
    setLen(0)
  }, [text, speaker, normalized])

  useEffect(() => {
    const key = `${speaker}|${normalized}`
    if (len < normalized.length) {
      reportedRef.current = ''
      return
    }
    if (!onTypingComplete || normalized.length === 0) return
    if (reportedRef.current === key) return
    reportedRef.current = key
    onTypingComplete()
  }, [len, onTypingComplete, speaker, normalized, normalized.length])

  useEffect(() => {
    if (len >= normalized.length) return
    const id = window.setTimeout(() => {
      setLen((n) => {
        if (n >= normalized.length) return n
        const ch = normalized[n]!
        if (!/\s/.test(ch)) speakBlipForSpeaker(speaker)
        return Math.min(n + 1, normalized.length)
      })
    }, 19)
    return () => window.clearTimeout(id)
  }, [len, normalized, speaker])

  const skipOrAdvance = useCallback(() => {
    if (!full) {
      setLen(normalized.length)
      return
    }
    if (choices?.length) return
    if (extraButtons?.length) return
    onAdvance?.()
  }, [choices, extraButtons, full, normalized.length, onAdvance])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        skipOrAdvance()
      }
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [skipOrAdvance])

  const visible = normalized.slice(0, len)

  return (
    <div
      className="gondola-dialog"
      onClick={skipOrAdvance}
      onPointerDownCapture={unlockGondolaAudio}
      role="presentation"
    >
      <div className="gondola-speaker">{speaker}</div>
      <div className="gondola-text">{visible}</div>
      {full && choices && choices.length > 0 ? (
        <div className="gondola-btn-row" onClick={(e) => e.stopPropagation()}>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="gondola-btn"
              onClick={() => {
                gondolaSounds.ui()
                onPickChoice?.(c.id)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
      {full && extraButtons && extraButtons.length > 0 ? (
        <div className="gondola-btn-row" onClick={(e) => e.stopPropagation()}>
          {extraButtons.map((b) => (
            <button
              key={b.label}
              type="button"
              className="gondola-btn"
              onClick={() => {
                gondolaSounds.ui()
                b.onClick()
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : null}
      {full && !choices?.length && !extraButtons?.length ? (
        <p className="mt-2 text-[10px] text-[#888]">Click, Enter o Espacio para continuar</p>
      ) : null}
    </div>
  )
}
