const FILTERS = [
  'Todos',
  'Alimentos',
  'Infancia',
  'Transporte',
  'Educación',
  'Salud',
  'Vivienda',
  'Obra pública',
  'Servicios sociales',
  'Otros',
] as const

export type CategoryFilterValue = (typeof FILTERS)[number]

export function CategoryFilters(props: {
  value: CategoryFilterValue
  onChange: (v: CategoryFilterValue) => void
}) {
  const { value, onChange } = props

  return (
    <div className="flex flex-wrap gap-2 pb-8 border-b border-[#252638]">
      {FILTERS.map((label) => {
        const active = value === label
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={[
              'px-3 py-2 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase border transition-colors',
              active
                ? 'border-[#2f80ff] text-[#2f80ff] bg-[#10111a]'
                : 'border-[#252638] text-[#8b8da5] bg-[#0d0e16] hover:border-[#2f80ff]/50 hover:text-[#f4f4f7]',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
