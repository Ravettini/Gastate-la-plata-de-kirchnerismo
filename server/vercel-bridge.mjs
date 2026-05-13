import { processDashboardRequest } from './dashboard-handlers.mjs'

async function rawBodyFromReq(req) {
  const b = req.body
  if (b !== undefined && b !== null) {
    if (typeof b === 'string') return b
    if (Buffer.isBuffer(b)) return b.toString('utf8')
    if (typeof b === 'object') return JSON.stringify(b)
  }
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => {
      data += c
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {string} pathnameForzado ej. /api/login
 */
export async function sendDashboardResponse(req, res, pathnameForzado) {
  const pathname = pathnameForzado || new URL(req.url || '/', 'http://local').pathname
  const method = req.method || 'GET'
  const rawBody = method === 'POST' || method === 'PUT' ? await rawBodyFromReq(req) : ''
  const headers = /** @type {Record<string, string | string[] | undefined>} */ ({ ...req.headers })
  const out = await processDashboardRequest({ method, pathname, headers, rawBody })
  res.statusCode = out.status
  for (const [k, v] of Object.entries(out.headers)) {
    if (v === undefined) continue
    res.setHeader(k, v)
  }
  res.end(out.body)
}
