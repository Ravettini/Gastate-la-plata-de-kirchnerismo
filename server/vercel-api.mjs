import { processAnalyticsRequest } from './analytics-api.mjs'

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = ''
    req.on('data', (c) => {
      b += c
    })
    req.on('end', () => resolve(b))
    req.on('error', reject)
  })
}

/** Handler único para rutas /api/* en Vercel. */
export async function runVercelAnalytics(req, res) {
  const url = new URL(req.url || '/', 'http://local')
  const pathname = url.pathname
  const method = req.method || 'GET'
  const rawBody = method === 'POST' ? await readBody(req) : ''
  const out = await processAnalyticsRequest({
    method,
    pathname,
    headers: /** @type {Record<string, string | string[] | undefined>} */ (req.headers),
    rawBody,
  })
  res.statusCode = out.status
  for (const [k, v] of Object.entries(out.headers)) {
    if (v !== undefined) res.setHeader(k, v)
  }
  res.end(out.body)
}
