import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/dashboardTrack'

/** Registra vistas de página y clics para el panel /dashboard (API /api/track). */
export function AnalyticsTracker() {
  const loc = useLocation()

  useEffect(() => {
    void trackEvent('pageview', { path: loc.pathname + loc.search })
  }, [loc.pathname, loc.search])

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const t = ev.target as HTMLElement | null
      if (!t) return
      const label =
        t.getAttribute('data-track') ||
        (t.innerText || '').trim().slice(0, 80) ||
        t.tagName.toLowerCase()
      void trackEvent('click', {
        label,
        tag: t.tagName,
        path: window.location.pathname,
      })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
