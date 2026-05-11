import { Link } from 'react-router-dom'
import type { CaseData } from '../types'
import { formatCurrency } from '../utils/format'
import { SafeImage } from './SafeImage'

export function CauseCard(props: { caseData: CaseData }) {
  const { caseData: c } = props
  const hasAmount = c.amount != null

  return (
    <Link
      to={`/caso/${c.id}`}
      className="group block bg-[#10111a] border border-[#252638] rounded-xl overflow-hidden hover:border-[#2f80ff] transition-colors cursor-pointer"
    >
      <div className="p-6 sm:p-8 flex flex-col gap-5 min-h-[280px]">
        <div className="flex items-start gap-4">
          <SafeImage
            src={c.imageUrl}
            alt={c.shortName}
            rounded="full"
            className="h-16 w-16 sm:h-[72px] sm:w-[72px] object-cover shrink-0 border border-[#252638]"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#5e6078] uppercase leading-snug">
              {c.amountLabel}
            </div>
            <h2 className="mt-2 text-sm sm:text-base font-bold tracking-[0.12em] text-[#f5f5fa] uppercase leading-snug">
              {c.shortName}
            </h2>
          </div>
        </div>

        <div className="mt-auto">
          {hasAmount ? (
            <div className="font-extrabold text-2xl sm:text-3xl text-[#f5f5fa] tabular-nums tracking-tight break-words">
              {formatCurrency(c.amount!, c.currency)}
            </div>
          ) : (
            <div className="font-extrabold text-xl sm:text-2xl text-[#8b8da5] tracking-[0.2em] uppercase">
              Sin monto único
            </div>
          )}
          <div className="mt-1 text-xs text-[#5e6078] font-medium tracking-widest uppercase">Pesos (ARS)</div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#252638]">
          <span className="text-[11px] font-bold tracking-[0.35em] text-[#2f80ff] uppercase group-hover:text-[#5da0ff] transition-colors">
            Entrar
          </span>
          <span className="text-[#252638] group-hover:text-[#2f80ff] transition-colors" aria-hidden>
            →
          </span>
        </div>
      </div>
      <div className="h-[2px] bg-[#252638] group-hover:bg-[#2f80ff] transition-colors" />
    </Link>
  )
}
