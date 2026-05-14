import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GondolaGame } from '../gondolaGame/GondolaGame'

export function GameGondola() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="gondola-page">
      <div className="gondola-page-nav">
        <Link
          to="/"
          className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#7ee8fa] hover:text-[#ffeb3b]"
        >
          ← Volver al inicio
        </Link>
      </div>
      <GondolaGame />
    </div>
  )
}
