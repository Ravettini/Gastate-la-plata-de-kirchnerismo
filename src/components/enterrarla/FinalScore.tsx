import { finalRankLabel } from '../../utils/enterrarlaGeo'

export function FinalScore(props: {
  totalScore: number
  maxTotalPossible: number
  roundCount: number
  avgDistanceKm: number
  closeHits: number
  onRestart: () => void
}) {
  const { totalScore, maxTotalPossible, roundCount, avgDistanceKm, closeHits, onRestart } = props
  const pct = maxTotalPossible > 0 ? (totalScore / maxTotalPossible) * 100 : 0
  const rank = finalRankLabel(pct)
  const avgText = Number.isFinite(avgDistanceKm) ? avgDistanceKm.toFixed(1) : '—'

  return (
    <section
      className="rounded-[18px] border border-[#2A2F3A] bg-[#171A21] p-6 sm:p-8 text-center space-y-6 max-w-xl mx-auto"
      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}
    >
      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.12em] text-[#F6C445]">Expediente cerrado</h2>
      <p className="text-xs text-[#A7ADB8]">
        Completaste <span className="font-bold text-[#F5F5F5]">{roundCount}</span> expedientes.
      </p>
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A7ADB8]">Puntaje total</p>
        <p className="text-4xl font-black tabular-nums text-[#22C55E]">{totalScore}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="rounded-xl border border-[#2A2F3A] bg-[#0F1115] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A7ADB8]">Distancia promedio</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#F5F5F5]">
            {avgText} <span className="text-sm font-semibold text-[#A7ADB8]">km</span>
          </p>
        </div>
        <div className="rounded-xl border border-[#2A2F3A] bg-[#0F1115] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A7ADB8]">Aciertos cercanos (≤ 25 km)</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#F5F5F5]">{closeHits}</p>
        </div>
      </div>
      <div className="rounded-xl border border-[#F6C445]/40 bg-[#F6C445]/10 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F6C445] mb-2">Tu rango</p>
        <p className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug">{rank}</p>
        <p className="mt-2 text-xs text-[#A7ADB8]">
          Rendimiento ≈ {pct.toFixed(0)}% del puntaje máximo posible según la dificultad de cada expediente.
        </p>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="w-full sm:w-auto min-w-[200px] rounded-xl bg-[#F6C445] px-8 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-[#0F1115] hover:bg-[#e6b63d] transition-colors"
      >
        Volver a cavar
      </button>
    </section>
  )
}
