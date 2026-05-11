import type { ReactNode } from 'react'

export function CircleButton(props: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant: 'plus' | 'minus'
  ariaLabel: string
}) {
  const { children, onClick, disabled, variant, ariaLabel } = props
  const base =
    'h-8 w-8 rounded-full flex items-center justify-center text-base font-semibold leading-none transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
  const styles =
    variant === 'plus'
      ? 'border border-[#2f80ff] text-[#2f80ff] hover:bg-[#2f80ff] hover:text-[#080912]'
      : 'border border-[#252638] text-[#8b8da5] hover:border-[#2f80ff] hover:text-[#5da0ff]'

  return (
    <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={onClick} className={[base, styles].join(' ')}>
      {children}
    </button>
  )
}
