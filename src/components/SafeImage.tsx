import { useState } from 'react'

function initialsFromAlt(alt: string) {
  const w = alt.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9]+/g, ' ').trim().split(' ')
  const a = w[0]?.[0] ?? '?'
  const b = w[1]?.[0] ?? ''
  return (a + b).toUpperCase()
}

export function SafeImage(props: {
  src: string
  alt: string
  className?: string
  rounded?: 'none' | 'full' | 'lg'
}) {
  const { src, alt, className = '', rounded = 'none' } = props
  const [failed, setFailed] = useState(false)

  const roundClass =
    rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-xl' : ''

  if (failed) {
    return (
      <div
        className={[
          'flex items-center justify-center bg-[#0d0e16] text-[#5e6078] text-xs font-semibold tracking-widest border border-[#252638]',
          roundClass,
          className,
        ].join(' ')}
        role="img"
        aria-label={alt}
      >
        {initialsFromAlt(alt)}
      </div>
    )
  }

  const isRemote = src.startsWith('http://') || src.startsWith('https://')

  return (
    <img
      src={src}
      alt={alt}
      className={[roundClass, className].filter(Boolean).join(' ')}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      referrerPolicy={isRemote ? 'no-referrer' : undefined}
    />
  )
}
