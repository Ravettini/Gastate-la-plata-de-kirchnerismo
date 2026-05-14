import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

function pagePath() {
  return window.location.pathname + window.location.search
}

/** GA4: definí `VITE_GA_MEASUREMENT_ID` (ej. G-XXXX) en Vercel o `.env.local`. */
export function GoogleAnalytics() {
  const loc = useLocation()

  useEffect(() => {
    if (!GA_ID) return

    if (!document.getElementById('gtag-js')) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      const s = document.createElement('script')
      s.id = 'gtag-js'
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      s.onload = () => {
        window.gtag?.('js', new Date())
        window.gtag?.('config', GA_ID, { page_path: pagePath() })
      }
      document.head.appendChild(s)
      return
    }

    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: loc.pathname + loc.search })
    }
  }, [loc.pathname, loc.search])

  return null
}
