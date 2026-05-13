/**
 * Lógica compartida del panel /dashboard (login, tracking, agregados).
 * Usada por las funciones serverless en /api y por el middleware de Vite en desarrollo.
 */
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

const COOKIE_NAME = 'poli_dashboard'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60
const DATA_FILE = path.join(process.cwd(), 'data', 'analytics.ndjson')

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

export function getSessionFromHeaders(headers, secret) {
  const cookies = parseCookies(headers.cookie)
  const raw = cookies[COOKIE_NAME]
  if (!raw) return null
  return verifySessionToken(raw, secret)
}

function serverVisitorId(headers) {
  const ip =
    String(headers['x-forwarded-for'] || '')
      .split(',')[0]
      ?.trim() ||
    headers['x-real-ip'] ||
    ''
  const ua = headers['user-agent'] || ''
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 28)
}

async function kvPush(event) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return false
  try {
    const { kv } = await import('@vercel/kv')
    await kv.lpush('analytics:events', JSON.stringify(event))
    return true
  } catch (e) {
    console.error('[analytics] KV lpush:', e)
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
    console.error('[analytics] KV lrange:', e)
    return null
  }
}

function memEvents() {
  if (!globalThis.__POLI_ANALYTICS__) globalThis.__POLI_ANALYTICS__ = []
  return globalThis.__POLI_ANALYTICS__
}

export async function appendEvent(event) {
  const usedKv = await kvPush(event)
  if (usedKv) return
  if (process.env.VERCEL) {
    memEvents().push(event)
    return
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.appendFileSync(DATA_FILE, JSON.stringify(event) + '\n', 'utf8')
}

export async function readAllEvents() {
  const fromKv = await kvReadAll()
  if (fromKv) return fromKv
  if (process.env.VERCEL && globalThis.__POLI_ANALYTICS__) {
    return [...globalThis.__POLI_ANALYTICS__]
  }
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
      const label = e.meta.label || e.meta.selector || 'elemento'
      const key = `${label} — ${e.meta.path || ruta}`
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

/**
 * @param {{ method: string, pathname: string, headers: Record<string, string | string[] | undefined>, rawBody: string }} req
 */
export async function processDashboardRequest(req) {
  const { method, pathname, headers, rawBody } = req
  const h = /** @type {Record<string, string>} */ (
    Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(',') : String(v ?? '')]),
    )
  )

  const email = (process.env.DASHBOARD_EMAIL || '').trim().toLowerCase()
  const hash = (process.env.DASHBOARD_PASSWORD_HASH || '').trim()
  const secret = (process.env.DASHBOARD_SESSION_SECRET || '').trim()

  if (pathname === '/api/login' && method === 'POST') {
    if (!hash || !secret || !email) {
      return makeJson(503, { ok: false, error: 'Faltan variables DASHBOARD_* en el servidor.' })
    }
    const body = readJsonBody(rawBody)
    const em = String(body.email || '')
      .trim()
      .toLowerCase()
    const pw = String(body.password || '')
    if (!em || !pw) return makeJson(400, { ok: false, error: 'Completá email y contraseña.' })
    if (em !== email) return makeJson(401, { ok: false, error: 'Credenciales incorrectas.' })
    const ok = bcrypt.compareSync(pw, hash)
    if (!ok) return makeJson(401, { ok: false, error: 'Credenciales incorrectas.' })
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
      serverVisitorId: serverVisitorId(h),
      clientVisitorId: String(body.clientVisitorId || '').slice(0, 64),
    }
    await appendEvent(event)
    return makeJson(200, { ok: true })
  }

  if (pathname === '/api/analytics' && method === 'GET') {
    if (!secret) {
      return makeJson(503, { ok: false, error: 'Servidor sin DASHBOARD_SESSION_SECRET.' })
    }
    const cookies = parseCookies(h.cookie)
    const session = verifySessionToken(cookies[COOKIE_NAME], secret)
    if (!session) return makeJson(401, { ok: false, error: 'No autorizado.' })
    const events = await readAllEvents()
    const summary = summarizeEvents(events)
    const recientes = events.slice(-80).reverse()
    return makeJson(200, { ok: true, summary, recientes })
  }

  return makeJson(404, { ok: false, error: 'Not found' })
}

export { COOKIE_NAME }
