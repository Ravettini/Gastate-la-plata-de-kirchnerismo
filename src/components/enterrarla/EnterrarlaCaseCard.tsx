import type { GameCase } from '../../data/enterrarlaTodaCases'

export function EnterrarlaCaseCard(props: { gameCase: GameCase; roundLabel: string }) {
  const { gameCase, roundLabel } = props
  return (
    <section
      className="rounded-[18px] border border-[#2A2F3A] bg-[#171A21] p-5 sm:p-6 shadow-lg"
      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F6C445]">{roundLabel}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A7ADB8]">
          {gameCase.difficulty}
        </span>
      </div>
      <h2 className="text-lg sm:text-xl font-extrabold text-[#F5F5F5] leading-tight">{gameCase.title}</h2>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#A7ADB8]">{gameCase.category}</p>
      <p className="mt-4 text-sm leading-relaxed text-[#F5F5F5]/90">{gameCase.context}</p>
      <div className="mt-5 rounded-xl border border-[#2A2F3A] bg-[#0F1115]/80 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F6C445] mb-1.5">Pista geográfica</p>
        <p className="text-sm text-[#A7ADB8] leading-relaxed">{gameCase.hint}</p>
      </div>
    </section>
  )
}
