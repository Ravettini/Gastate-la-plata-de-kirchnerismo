/** Credenciales fijas del panel /dashboard (solo front; visibles en el bundle). */
export const DASHBOARD_EMAIL = 'polijuegos@gmail.com'
export const DASHBOARD_PASSWORD = 'polijuegos23423'

const VID_KEY = 'poli_analytics_vid'
const EVENTS_KEY = 'poli_analytics_events'
const AUTH_KEY = 'poli_dashboard_ok'
const MAX_EVENTS = 2500

export type AnalyticsEvent = {
  t: number
  type: string
  path: string
  referrer: string
  meta: Record<string, unknown>
  clientVisitorId: string
}

export type AnalyticsSummary = {
  totalEventos: number
  visitantesAprox: number
  porReferrer: Record<string, number>
  porRuta: Record<string, number>
  porTipo: Record<string, number>
  clics: Record<string, number>
}

function getClientVisitorId(): string {
  try {
    let id = sessionStorage.getItem(VID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(VID_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

function readEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter((e) => e && typeof e === 'object' && typeof (e as AnalyticsEvent).t === 'number') as AnalyticsEvent[]
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  try {
    const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed))
  } catch {
    /* cuota llena */
  }
}

export function trackEvent(type: string, meta?: Record<string, unknown>) {
  try {
    const ev: AnalyticsEvent = {
      t: Date.now(),
      type,
      path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      clientVisitorId: getClientVisitorId(),
      meta: meta || {},
    }
    const list = readEvents()
    list.push(ev)
    writeEvents(list)
  } catch {
    /* */
  }
}

export function summarizeEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const porReferrer: Record<string, number> = {}
  const porRuta: Record<string, number> = {}
  const porTipo: Record<string, number> = {}
  const clics: Record<string, number> = {}
  const visitantes = new Set<string>()

  for (const e of events) {
    visitantes.add(e.clientVisitorId || 'desconocido')
    const tipo = e.type || 'unknown'
    porTipo[tipo] = (porTipo[tipo] || 0) + 1
    const ref = e.referrer && e.referrer.trim() ? e.referrer.trim() : '(directo / sin referrer)'
    porReferrer[ref] = (porReferrer[ref] || 0) + 1
    const ruta = e.path || '/'
    porRuta[ruta] = (porRuta[ruta] || 0) + 1
    if (tipo === 'click' && e.meta) {
      const label = String(e.meta.label || e.meta.selector || 'elemento')
      const key = `${label} — ${String(e.meta.path || ruta)}`
      clics[key] = (clics[key] || 0) + 1
    }
  }

  return {
    totalEventos: events.length,
    visitantesAprox: visitantes.size,
    porReferrer,
    porRuta,
    porTipo,
    clics,
  }
}

export function loadAnalyticsFromStorage(): { summary: AnalyticsSummary; recientes: AnalyticsEvent[] } {
  const events = readEvents()
  const summary = summarizeEvents(events)
  const recientes = [...events].reverse().slice(0, 80)
  return { summary, recientes }
}

export function isDashboardSessionOpen(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export function openDashboardSession() {
  try {
    sessionStorage.setItem(AUTH_KEY, '1')
  } catch {
    /* */
  }
}

export function closeDashboardSession() {
  try {
    sessionStorage.removeItem(AUTH_KEY)
  } catch {
    /* */
  }
}

export function tryDashboardLogin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === DASHBOARD_EMAIL.toLowerCase() && password === DASHBOARD_PASSWORD
  if (ok) openDashboardSession()
  return ok
}
