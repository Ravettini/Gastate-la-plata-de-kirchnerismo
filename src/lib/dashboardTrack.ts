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

export async function trackEvent(type: string, meta?: Record<string, unknown>) {
  try {
    const body = {
      type,
      path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      clientVisitorId: getClientVisitorId(),
      meta: meta || {},
    }
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    })
  } catch {
    /* sin red o api caída */
  }
}
