import type { CaseData, Currency, SpendItem } from '../types'
import { formatCurrency, unitPriceForCurrency } from '../utils/format'

export function ReceiptPanel(props: {
  caseData: CaseData
  currency: Currency
  lines: Array<{ item: SpendItem; quantity: number }>
  totalGastado: number
  restante: number
  porcentaje: number
  onReset: () => void
  compact?: boolean
}) {
  const { caseData, currency, lines, totalGastado, restante, porcentaje, onReset, compact } = props
  const isOver = restante < 0
  const c = compact === true

  async function copySummary() {
    if (lines.length === 0) {
      await navigator.clipboard.writeText(`Caso: ${caseData.name}. Todavía no gastaste nada.`)
      return
    }
    const parts = lines.map((l) => `${l.quantity}× ${l.item.name}`)
    const text = `Caso: ${caseData.name}. ${parts.join(', ')}. Total: ${formatCurrency(totalGastado, currency)}.`
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className={[c ? 'space-y-3' : 'space-y-6', 'min-w-0'].join(' ')}>
      <div>
        <h2 className={[c ? 'text-[10px] tracking-[0.35em]' : 'text-xs tracking-[0.4em]', 'font-bold text-[#8b8da5] uppercase'].join(' ')}>
          TU RECIBO
        </h2>
        <div className={[c ? 'thin-divider mt-2' : 'thin-divider mt-4'].join(' ')} />
      </div>

      {lines.length === 0 ? (
        <p className={[c ? 'text-xs' : 'text-sm', 'text-[#8b8da5] leading-relaxed'].join(' ')}>Todavía no gastaste nada 👀</p>
      ) : (
        <ul className={c ? 'space-y-2' : 'space-y-4'}>
          {lines.map(({ item, quantity }) => {
            const unit = unitPriceForCurrency(item, currency)
            const sub = unit * quantity
            return (
              <li key={item.id} className={[c ? 'pb-2 gap-0.5' : 'pb-3 gap-1', 'flex flex-col border-b border-[#252638] last:border-0'].join(' ')}>
                <div
                  className={[
                    c ? 'text-[10px] tracking-[0.1em]' : 'text-[11px] tracking-[0.15em]',
                    'flex justify-between gap-3 font-bold text-[#f5f5fa] uppercase',
                  ].join(' ')}
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0 tabular-nums">×{quantity}</span>
                </div>
                <div className={[c ? 'text-[10px]' : 'text-xs', 'text-[#2f80ff] font-semibold tabular-nums'].join(' ')}>
                  {formatCurrency(sub, currency)}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className={[c ? 'space-y-2 text-xs' : 'space-y-3 text-sm'].join(' ')}>
        <div className="flex justify-between gap-4 text-[#8b8da5]">
          <span className={[c ? 'text-[9px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]', 'uppercase font-semibold'].join(' ')}>Gastaste</span>
          <span className="tabular-nums text-[#f5f5fa] font-bold">{formatCurrency(totalGastado, currency)}</span>
        </div>
        <div className="flex justify-between gap-4 text-[#8b8da5]">
          <span className={[c ? 'text-[9px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]', 'uppercase font-semibold'].join(' ')}>Te queda</span>
          <span className={`tabular-nums font-bold ${isOver ? 'text-[#ff4d4d]' : 'text-[#f5f5fa]'}`}>
            {formatCurrency(restante, currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-[#8b8da5]">
          <span className={[c ? 'text-[9px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]', 'uppercase font-semibold'].join(' ')}>%</span>
          <span className="tabular-nums text-[#f5f5fa] font-bold">{porcentaje.toFixed(1)}%</span>
        </div>
        {isOver ? (
          <div className={[c ? 'text-[9px]' : 'text-xs', 'font-bold text-[#ff4d4d] tracking-wide uppercase pt-1'].join(' ')}>
            Te pasaste por: {formatCurrency(Math.abs(restante), currency)}
          </div>
        ) : null}
      </div>

      <div className={[c ? 'flex flex-col gap-1.5 pt-1' : 'flex flex-col gap-2 pt-2'].join(' ')}>
        <button
          type="button"
          onClick={onReset}
          className={[
            c ? 'py-2 text-[9px] tracking-[0.22em]' : 'py-3 text-[11px] tracking-[0.28em]',
            'w-full rounded-lg border border-[#252638] font-bold uppercase text-[#f5f5fa] hover:border-[#2f80ff] hover:text-[#5da0ff] transition-colors',
          ].join(' ')}
        >
          Empezar de nuevo
        </button>
        <button
          type="button"
          onClick={() => void copySummary()}
          className={[
            c ? 'py-2 text-[9px] tracking-[0.22em]' : 'py-3 text-[11px] tracking-[0.28em]',
            'w-full rounded-lg border border-[#2f80ff] font-bold uppercase text-[#2f80ff] hover:bg-[#2f80ff] hover:text-[#080912] transition-colors',
          ].join(' ')}
        >
          Copiar resumen
        </button>
      </div>
    </div>
  )
}
