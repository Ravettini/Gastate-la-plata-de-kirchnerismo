import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCaseById } from '../data/cases'
import { spendItems } from '../data/items'
import type { Currency } from '../types'
import { formatCurrency, unitPriceForCurrency } from '../utils/format'
import { CategoryFilters, type CategoryFilterValue } from '../components/CategoryFilters'
import { ProgressBar } from '../components/ProgressBar'
import { ReceiptPanel } from '../components/ReceiptPanel'
import { SealLogo } from '../components/SealLogo'
import { SafeImage } from '../components/SafeImage'
import { SpendItemCard } from '../components/SpendItemCard'
import { hashString32, shuffleWithSeed } from '../utils/shuffleSeed'

const NAV_COMPACT_THRESHOLD_PX = 64

export function CaseSimulator() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const caseData = id ? getCaseById(id) : undefined

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<CategoryFilterValue>('Todos')
  const [scrollCompact, setScrollCompact] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setQuantities({})
    setFilter('Todos')
  }, [id])

  useEffect(() => {
    if (!caseData || caseData.amount == null) navigate('/', { replace: true })
  }, [caseData, navigate])

  useEffect(() => {
    const updateCompact = () => {
      const el = heroRef.current
      if (!el) return
      const bottom = el.getBoundingClientRect().bottom
      setScrollCompact(bottom < NAV_COMPACT_THRESHOLD_PX)
    }
    updateCompact()
    window.addEventListener('scroll', updateCompact, { passive: true })
    window.addEventListener('resize', updateCompact)
    return () => {
      window.removeEventListener('scroll', updateCompact)
      window.removeEventListener('resize', updateCompact)
    }
  }, [])

  if (!caseData) return null

  const currency: Currency = caseData.currency
  const amount = caseData.amount
  if (amount == null) return null

  const itemsFiltered = useMemo(() => {
    const base = filter === 'Todos' ? spendItems : spendItems.filter((i) => i.category === filter)
    const seed = hashString32(`${id ?? ''}\0${filter}`)
    return shuffleWithSeed(base, seed)
  }, [filter, id])

  const totalGastado = useMemo(() => {
    return spendItems.reduce((acc, item) => {
      const q = quantities[item.id] ?? 0
      if (q <= 0) return acc
      return acc + unitPriceForCurrency(item, currency) * q
    }, 0)
  }, [currency, quantities])

  const restante = amount - totalGastado
  const porcentaje = amount > 0 ? (totalGastado / amount) * 100 : 0
  const ratio = amount > 0 ? totalGastado / amount : 0

  const receiptLines = useMemo(() => {
    return spendItems
      .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
      .filter((x) => x.quantity > 0)
  }, [quantities])

  function setQty(itemId: string, q: number) {
    const n = Math.max(0, Math.floor(Number.isFinite(q) ? q : 0))
    setQuantities((prev) => ({ ...prev, [itemId]: n }))
  }

  const receiptProps = {
    caseData,
    currency,
    lines: receiptLines,
    totalGastado,
    restante,
    porcentaje,
    onReset: () => setQuantities({}),
  }

  const statsLine = (
    <p className="mt-3 text-[10px] sm:text-[11px] font-medium tracking-[0.1em] text-[#8b8da5] uppercase tabular-nums text-center leading-relaxed">
      {porcentaje.toFixed(1)}% gastado · {formatCurrency(Math.max(restante, 0), currency)} restantes
      {restante < 0 ? (
        <span className="text-[#ff4d4d]"> · exceso {formatCurrency(Math.abs(restante), currency)}</span>
      ) : null}
    </p>
  )

  return (
    <div className="min-h-screen bg-[#080912] text-[#f4f4f7] font-sans antialiased">
      <nav className="sticky top-0 z-40 border-b border-[#252638] bg-[#080912]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#8b8da5] hover:text-[#2f80ff] transition-colors shrink-0"
          >
            ← VOLVER
          </Link>
          <SealLogo size={36} />
        </div>
      </nav>

      {/* Hero grande arriba de todo (todas las vistas); al scrollear sale de vista y en desktop aparece el mini a la derecha */}
      <section
        ref={heroRef}
        className="max-w-4xl mx-auto w-full px-5 sm:px-8 pt-8 pb-10 sm:pb-12 text-center"
      >
        <p className="eyebrow text-[#8b8da5]">Gastá la plata de</p>
        <h1 className="mt-3 font-bold text-[#f5f5fa] uppercase leading-snug text-base sm:text-lg tracking-[0.18em] px-1">
          {caseData.name}
        </h1>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 w-full min-w-0">
          <SafeImage
            src={caseData.imageUrl}
            alt={caseData.shortName}
            rounded="full"
            className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36 object-cover border border-[#252638] shrink-0"
          />
          <div className="w-full min-w-0 max-w-full flex justify-center sm:justify-center sm:flex-1 sm:min-w-0">
            <div className="max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:thin] px-1 sm:px-0 [scrollbar-color:#252638_transparent]">
              <div className="massive-number massive-number-nowrap text-[#f5f5fa] tabular-nums text-center sm:text-left inline-block min-w-0">
                {formatCurrency(amount, currency)}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-10">
          <ProgressBar ratio={ratio} isOver={restante < 0} />
        </div>
        {statsLine}
        <div className="thin-divider max-w-2xl mx-auto mt-8 sm:mt-10" />
        <p className="mt-6 text-[10px] tracking-[0.35em] text-[#5e6078] uppercase">Simulador · Montos aproximados</p>
      </section>

      {/* items-stretch (default): la columna derecha tiene la misma altura que el main → position:sticky funciona */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:gap-x-10 lg:items-stretch">
        <main className="min-w-0 order-1 flex flex-col gap-8">
          <CategoryFilters value={filter} onChange={setFilter} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            {itemsFiltered.map((item) => (
              <SpendItemCard
                key={item.id}
                item={item}
                currency={currency}
                quantity={quantities[item.id] ?? 0}
                remaining={restante}
                onChangeQuantity={(q) => setQty(item.id, q)}
              />
            ))}
          </div>
        </main>

        <aside className="hidden lg:flex order-2 w-full min-w-0 flex-col">
          {/* Sticky sin overflow en este nodo: overflow-y en el mismo elemento rompe el pegado al viewport */}
          <div className="sticky top-16 flex min-h-0 w-full max-w-full flex-col gap-5 border-l border-[#252638] pl-6 pr-1 max-h-[calc(100vh-4.5rem)]">
            <div
              className={[
                'shrink-0 transition-all duration-300 ease-out overflow-hidden',
                scrollCompact ? 'max-h-[min(520px,70vh)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
              ].join(' ')}
            >
              <div className="border border-[#252638] rounded-xl bg-[#10111a] p-4 min-w-0">
                <p className="eyebrow text-[#8b8da5] text-left text-[10px]">Gastá la plata de</p>
                <h2 className="mt-2 font-bold text-[#f5f5fa] uppercase leading-snug text-[10px] tracking-[0.15em] line-clamp-3 text-left">
                  {caseData.name}
                </h2>
                <div className="mt-4 flex flex-col gap-3 min-w-0">
                  <div className="flex flex-row items-center gap-3 min-w-0">
                    <SafeImage
                      src={caseData.imageUrl}
                      alt={caseData.shortName}
                      rounded="full"
                      className="h-11 w-11 shrink-0 object-cover border border-[#252638]"
                    />
                    <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:thin] pr-0.5">
                      <div className="text-sm font-extrabold text-[#f5f5fa] tabular-nums leading-tight whitespace-nowrap">
                        {formatCurrency(amount, currency)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-3 min-w-0">
                  <ProgressBar ratio={ratio} isOver={restante < 0} />
                </div>
                <p className="mt-2 text-[9px] sm:text-[10px] font-medium tracking-[0.08em] text-[#8b8da5] uppercase tabular-nums text-left leading-relaxed break-words">
                  {porcentaje.toFixed(1)}% gastado · {formatCurrency(Math.max(restante, 0), currency)} restantes
                  {restante < 0 ? (
                    <span className="text-[#ff4d4d]"> · exceso {formatCurrency(Math.abs(restante), currency)}</span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] pb-2">
              <ReceiptPanel {...receiptProps} compact={scrollCompact} />
            </div>
          </div>
        </aside>

        <section className="lg:hidden order-3 border-t border-[#252638] pt-10">
          <ReceiptPanel {...receiptProps} compact={false} />
        </section>
      </div>
    </div>
  )
}
