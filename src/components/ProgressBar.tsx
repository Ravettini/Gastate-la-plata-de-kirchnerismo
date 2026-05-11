export function ProgressBar(props: { ratio: number; isOver: boolean }) {
  const { ratio, isOver } = props
  const pct = Math.min(100, Math.max(0, ratio * 100))

  return (
    <div className="w-full h-[3px] bg-[#252638] overflow-hidden">
      <div
        className={['h-full transition-[width] duration-500 ease-out', isOver ? 'bg-[#ff4d4d]' : 'bg-[#2f80ff]'].join(
          ' ',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
