import { roundResultCopy } from '../../utils/enterrarlaGeo'

export function RoundResult(props: {
  distanceKm: number
  score: number
  targetLabel: string
  explanation: string
}) {
  const { distanceKm, score, targetLabel, explanation } = props
  const copy = roundResultCopy(distanceKm)
  const distText = distanceKm < 10 ? distanceKm.toFixed(2) : distanceKm.toFixed(1)

  return (
    <section
      className="rounded-[18px] border border-[#2A2F3A] bg-[#171A21] p-5 sm:p-6 space-y-4"
      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}
    >
      <p className="text-sm text-[#F5F5F5]">
        Tu marcador quedó a{' '}
        <span className="font-bold tabular-nums text-[#EF4444]">{distText} km</span> del punto correcto.
      </p>
      <p
        className={`text-sm font-medium ${
          copy.tone === 'excelente'
            ? 'text-[#22C55E]'
            : copy.tone === 'medio'
              ? 'text-[#F6C445]'
              : 'text-[#A7ADB8]'
        }`}
      >
        {copy.line}
      </p>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A7ADB8]">Puntaje ronda</span>
        <span className="text-2xl font-black tabular-nums text-[#22C55E]">{score}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F6C445] mb-1">Ubicación de referencia</p>
        <p className="text-sm text-[#F5F5F5]">{targetLabel}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A7ADB8] mb-1">Contexto</p>
        <p className="text-sm leading-relaxed text-[#A7ADB8]">{explanation}</p>
      </div>
    </section>
  )
}
