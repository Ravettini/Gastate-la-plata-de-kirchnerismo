export function SealLogo(props: { className?: string; size?: number }) {
  const { className = '', size = 44 } = props
  return (
    <div
      className={[
        'shrink-0 rounded-full border border-[#252638] bg-[#10111a] flex items-center justify-center text-[10px] font-bold tracking-[0.2em] text-[#8b8da5]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size }}
      aria-hidden
    >
      GLP
    </div>
  )
}
