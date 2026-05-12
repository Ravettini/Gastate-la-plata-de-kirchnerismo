import { useMemo } from 'react'
import type { Currency, SpendItem } from '../types'
import { formatCurrency, unitPriceForCurrency } from '../utils/format'
import { CircleButton } from './CircleButton'
import { SafeImage } from './SafeImage'

export function SpendItemCard(props: {
  item: SpendItem
  currency: Currency
  quantity: number
  remaining: number
  disabled?: boolean
  onChangeQuantity: (q: number) => void
}) {
  const { item, currency, quantity, remaining, disabled, onChangeQuantity } = props

  const unit = useMemo(() => unitPriceForCurrency(item, currency), [item, currency])
  const maxAdd = useMemo(() => {
    if (disabled || remaining <= 0 || unit <= 0) return 0
    return Math.floor(remaining / unit)
  }, [disabled, remaining, unit])

  const canEdit = !disabled

  const dec = () => onChangeQuantity(Math.max(0, quantity - 1))
  const inc = () => onChangeQuantity(quantity + 1)

  const bar = (
    <div className="flex items-center justify-between gap-2 px-2 py-1 bg-[#0d0e16] border-b border-[#252638] shrink-0">
      <span className="text-[9px] font-semibold tracking-[0.2em] text-[#8b8da5] uppercase tabular-nums truncate">
        Cant. {quantity}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <CircleButton variant="minus" ariaLabel={`Restar ${item.name}`} disabled={!canEdit || quantity <= 0} onClick={dec}>
          −
        </CircleButton>
        <CircleButton variant="plus" ariaLabel={`Sumar ${item.name}`} disabled={!canEdit} onClick={inc}>
          +
        </CircleButton>
      </div>
    </div>
  )

  return (
    <article className="bg-[#10111a] border border-[#252638] rounded-xl overflow-hidden flex flex-col min-w-0 h-full min-h-[360px] sm:min-h-[380px]">
      {bar}
      <div className="relative flex-1 min-h-[10.5rem] sm:min-h-[12rem] bg-[#0d0e16] border-b border-[#252638]">
        <SafeImage src={item.imageUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover rounded-none" rounded="none" />
      </div>
      <div className="px-2.5 py-2 flex flex-col gap-0.5 shrink-0">
        <h3 className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] text-[#f5f5fa] uppercase leading-snug line-clamp-2">
          {item.name}
        </h3>
        <div className="text-sm sm:text-[15px] font-bold text-[#2f80ff] tabular-nums tracking-tight break-words line-clamp-2 leading-tight">
          {formatCurrency(unit, currency)}
        </div>
      </div>
      <div className="mt-auto border-t border-[#252638] shrink-0">
        <div className="flex flex-col gap-1.5 px-2 py-2 bg-[#0d0e16]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl font-black tabular-nums text-[#f5f5fa] w-9 text-center shrink-0">{quantity}</span>
              <input
                aria-label={`Editar cantidad de ${item.name}`}
                type="number"
                min={0}
                step={1}
                disabled={!canEdit}
                value={quantity}
                onChange={(e) => {
                  const v = e.target.value === '' ? 0 : Number(e.target.value)
                  if (Number.isNaN(v)) return
                  onChangeQuantity(Math.max(0, Math.floor(v)))
                }}
                className="w-14 rounded-md border border-[#252638] bg-[#080912] text-center text-[11px] font-bold text-[#f5f5fa] py-1.5 tabular-nums disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <CircleButton variant="minus" ariaLabel={`Restar ${item.name}`} disabled={!canEdit || quantity <= 0} onClick={dec}>
                −
              </CircleButton>
              <CircleButton variant="plus" ariaLabel={`Sumar ${item.name}`} disabled={!canEdit} onClick={inc}>
                +
              </CircleButton>
            </div>
          </div>
          {canEdit && maxAdd > 0 ? (
            <button
              type="button"
              onClick={() => onChangeQuantity(quantity + maxAdd)}
              className="w-full py-1.5 text-[9px] font-bold tracking-[0.25em] uppercase text-[#5da0ff] hover:bg-[#10111a] border border-[#252638] rounded-md transition-colors"
            >
              Máx. +{maxAdd}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
