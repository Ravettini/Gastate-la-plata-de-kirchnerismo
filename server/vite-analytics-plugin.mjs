import { processAnalyticsRequest } from './analytics-api.mjs'

function readBodyConnect(req) {
  return new Promise((resolve, reject) => {
    let b = ''
    req.on('data', (c) => {
      b += c
    })
    req.on('end', () => resolve(b))
    req.on('error', reject)
  })
}

export function analyticsVitePlugin() {
  return {
    name: 'poli-analytics-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.startsWith('/api/')) {
          next()
          return
        }
        const method = req.method || 'GET'
        const rawBody = method === 'POST' || method === 'PUT' ? await readBodyConnect(req) : ''
        const headers = Object.fromEntries(
          Object.entries(req.headers || {}).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v || '']),
        )
        try {
          const out = await processAnalyticsRequest({ method, pathname: url, headers, rawBody })
          res.statusCode = out.status
          for (const [k, v] of Object.entries(out.headers)) {
            if (v !== undefined && v !== '') res.setHeader(k, v)
          }
          res.setHeader('Access-Control-Allow-Credentials', 'true')
          res.end(out.body)
        } catch (e) {
          console.error('[analytics api]', e)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: 'Error interno' }))
        }
      })
    },
  }
}
