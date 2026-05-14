import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const COOKIE_NAME = 'poli_dashboard'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60
const DATA_FILE = path.join(process.cwd(), 'data', 'analytics.ndjson')
const MEM_KEY = '__POLI_ANALYTICS_EVENTS__'

/**
 * Si no configurás DASHBOARD_* en Vercel o .env.local, se usan estos valores (solo en código de servidor).
 * Para producción serio, definí las variables de entorno y cambiá contraseña/secreto.
 */
const DEFAULT_DASHBOARD_EMAIL = 'polijuegos@gmail.com'
const DEFAULT_DASHBOARD_PASSWORD = 'polijuegos23423'
const DEFAULT_SESSION_SECRET =
  '334f65e682b924fd225fdb8d5c1d807cecdb60086a274f91ae8d95a6536c14841f6a030ee86475329e3dec2360749b1c'

function timingSafeEqualStr(a, b) {
  const ba = Buffer.from(String(a), 'utf8')
  const bb = Buffer.from(String(b), 'utf8')
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export function signSession(email, secret) {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000
  const payload = Buffer.from(JSON.stringify({ email, exp }), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySessionToken(token, secret) {
  if (!token || !secret) return null
  const parts = String(token).split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  if (!timingSafeEqualStr(sig, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

function parseCookies(header) {
  const out = {}
  if (!header) return out
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const k = part.slice(0, i).trim()
    out[k] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

function serverVisitorId(headers) {
  const h = /** @type {Record<string,string>} */ (headers)
  const ip =
    String(h['x-forwarded-for'] || '')
      .split(',')[0]
      ?.trim() ||
    h['x-real-ip'] ||
    ''
  const ua = h['user-agent'] || ''
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 28)
}

function makeJson(status, body, extraHeaders = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
    body: JSON.stringify(body),
  }
}

function readJsonBody(rawBody) {
  try {
    return JSON.parse(rawBody || '{}')
  } catch {
    return {}
  }
}

async function kvPush(event) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return false
  try {
    const { kv } = await import('@vercel/kv')
    await kv.lpush('analytics:events', JSON.stringify(event))
    await kv.ltrim('analytics:events', 0, 9999)
    return true
  } catch (e) {
    console.error('[analytics] kv lpush', e)
    return false
  }
}

async function kvReadAll() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  try {
    const { kv } = await import('@vercel/kv')
    const raw = await kv.lrange('analytics:events', 0, 9999)
    return raw.map((s) => JSON.parse(String(s))).filter(Boolean)
  } catch (e) {
    console.error('[analytics] kv lrange', e)
    return null
  }
}

function memPush(event) {
  if (!globalThis[MEM_KEY]) globalThis[MEM_KEY] = []
  globalThis[MEM_KEY].push(event)
  if (globalThis[MEM_KEY].length > 8000) globalThis[MEM_KEY].splice(0, globalThis[MEM_KEY].length - 8000)
}

function memRead() {
  return globalThis[MEM_KEY] ? [...globalThis[MEM_KEY]] : []
}

export function storageMode() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return 'kv'
  if (process.env.VERCEL) return 'memory'
  return 'file'
}

export async function appendEvent(event) {
  if (await kvPush(event)) return
  if (process.env.VERCEL) {
    memPush(event)
    return
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.appendFileSync(DATA_FILE, JSON.stringify(event) + '\n', 'utf8')
}

export async function readAllEvents() {
  const fromKv = await kvReadAll()
  if (fromKv) return fromKv
  if (process.env.VERCEL) return memRead()
  if (!fs.existsSync(DATA_FILE)) return []
  const text = fs.readFileSync(DATA_FILE, 'utf8')
  return text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

export function summarizeEvents(events) {
  const porReferrer = {}
  const porRuta = {}
  const porTipo = {}
  const clics = {}
  const visitantes = new Set()

  for (const e of events) {
    const vid = e.serverVisitorId || e.clientVisitorId || 'desconocido'
    visitantes.add(vid)
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

  const pageviews = events.filter((e) => e.type === 'pageview').length

  return {
    totalEventos: events.length,
    visitantesAprox: visitantes.size,
    /** Aproximación de “entradas” a la web: cada vista de página. */
    vistasPagina: pageviews,
    porReferrer,
    porRuta,
    porTipo,
    clics,
  }
}

/**
 * @param {{ method: string, pathname: string, headers: Record<string, string | string[] | undefined>, rawBody: string }} req
 */
export async function processAnalyticsRequest(req) {
  const { method, pathname, headers, rawBody } = req
  const h = /** @type {Record<string, string>} */ (
    Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(',') : String(v ?? '')]),
    )
  )

  const email = (process.env.DASHBOARD_EMAIL || DEFAULT_DASHBOARD_EMAIL).trim().toLowerCase()
  const password = process.env.DASHBOARD_PASSWORD || DEFAULT_DASHBOARD_PASSWORD
  const secret = (process.env.DASHBOARD_SESSION_SECRET || DEFAULT_SESSION_SECRET).trim()

  if (pathname === '/api/login' && method === 'POST') {
    const body = readJsonBody(rawBody)
    const em = String(body.email || '')
      .trim()
      .toLowerCase()
    const pw = String(body.password || '')
    if (!em || !pw) return makeJson(400, { ok: false, error: 'Completá email y contraseña.' })
    if (em !== email || !timingSafeEqualStr(pw, password)) {
      return makeJson(401, { ok: false, error: 'Credenciales incorrectas.' })
    }
    const token = signSession(em, secret)
    const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`
    return makeJson(200, { ok: true }, { 'set-cookie': cookie })
  }

  if (pathname === '/api/logout' && method === 'POST') {
    const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const clear = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
    return makeJson(200, { ok: true }, { 'set-cookie': clear })
  }

  if (pathname === '/api/track' && method === 'POST') {
    const body = readJsonBody(rawBody)
    const event = {
      t: Date.now(),
      type: String(body.type || 'unknown').slice(0, 64),
      path: String(body.path || '').slice(0, 512),
      referrer: String(body.referrer || '').slice(0, 1024),
      meta: typeof body.meta === 'object' && body.meta ? body.meta : {},
      clientVisitorId: String(body.clientVisitorId || '').slice(0, 64),
      serverVisitorId: serverVisitorId(h),
    }
    await appendEvent(event)
    return makeJson(204, { ok: true })
  }

  if (pathname === '/api/analytics' && method === 'GET') {
    const cookies = parseCookies(h.cookie)
    const session = verifySessionToken(cookies[COOKIE_NAME], secret)
    if (!session) return makeJson(401, { ok: false, error: 'No autorizado.' })
    const events = await readAllEvents()
    const summary = summarizeEvents(events)
    const recientes = events.slice(-80).reverse()
    return makeJson(200, {
      ok: true,
      summary,
      recientes,
      storage: storageMode(),
    })
  }

  return makeJson(404, { ok: false, error: 'Not found' })
}

export { COOKIE_NAME }
