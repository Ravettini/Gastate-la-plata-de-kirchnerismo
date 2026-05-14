const VID_KEY = 'poli_analytics_vid'

function getClientVisitorId(): string {
  try {
    let id = sessionStorage.getItem(VID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(VID_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

/** Registra un evento en el servidor (todos los visitantes). Falla en silencio si no hay API. */
export function trackEvent(type: string, meta?: Record<string, unknown>) {
  const body = {
    type,
    path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    clientVisitorId: getClientVisitorId(),
    meta: meta || {},
  }
  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'omit',
    keepalive: true,
  }).catch(() => {})
}

export type AnalyticsEvent = {
  t: number
  type: string
  path: string
  referrer: string
  meta: Record<string, unknown>
  clientVisitorId?: string
  serverVisitorId?: string
}

export type AnalyticsSummary = {
  totalEventos: number
  visitantesAprox: number
  vistasPagina: number
  porReferrer: Record<string, number>
  porRuta: Record<string, number>
  porTipo: Record<string, number>
  clics: Record<string, number>
}

export type AnalyticsApiResponse = {
  ok: boolean
  summary?: AnalyticsSummary
  recientes?: AnalyticsEvent[]
  storage?: 'kv' | 'memory' | 'file'
  error?: string
}

export async function apiLogin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const j = (await r.json()) as { ok?: boolean; error?: string }
  if (!r.ok || !j.ok) return { ok: false, error: j.error || 'Credenciales incorrectas.' }
  return { ok: true }
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
}

export async function fetchAnalytics(): Promise<AnalyticsApiResponse> {
  const r = await fetch('/api/analytics', { credentials: 'include' })
  return (await r.json()) as AnalyticsApiResponse
}
