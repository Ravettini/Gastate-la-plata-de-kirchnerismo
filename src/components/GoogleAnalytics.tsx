import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** GA4: por defecto G-ZWTR0CVWHC; podés sobreescribir con `VITE_GA_MEASUREMENT_ID` en `.env` / Vercel. */
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-ZWTR0CVWHC'

/**
 * Envía `page_path` en cada cambio de ruta (SPA). El script base de gtag.js está en `index.html`.
 */
export function GoogleAnalytics() {
  const loc = useLocation()

  useEffect(() => {
    if (!GA_ID) return

    const send = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_ID, { page_path: loc.pathname + loc.search })
      }
    }

    send()
    const t = window.setTimeout(send, 400)
    return () => window.clearTimeout(t)
  }, [loc.pathname, loc.search])

  return null
}
