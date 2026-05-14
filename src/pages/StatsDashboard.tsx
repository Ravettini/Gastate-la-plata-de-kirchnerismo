import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  apiLogin,
  apiLogout,
  fetchAnalytics,
  type AnalyticsEvent,
  type AnalyticsSummary,
} from '../lib/dashboardTrack'

function filasOrdenadas(obj: Record<string, number>, limite = 25) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
}

function storageLabel(s: string | undefined) {
  if (s === 'kv') return 'Almacenamiento: Redis/KV (persistente, todos los visitantes).'
  if (s === 'memory')
    return 'Almacenamiento: memoria del servidor (Vercel sin KV). Los datos se pierden cuando el servidor se apaga; igual ves visitas mientras hay tráfico.'
  if (s === 'file') return 'Almacenamiento: archivo local (solo desarrollo con npm run dev).'
  return ''
}

export function StatsDashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [recientes, setRecientes] = useState<AnalyticsEvent[]>([])
  const [storage, setStorage] = useState<string | undefined>()

  const aplicarDatos = useCallback((j: { summary?: AnalyticsSummary; recientes?: AnalyticsEvent[]; storage?: string }) => {
    setSummary(j.summary || null)
    setRecientes(j.recientes || [])
    setStorage(j.storage)
  }, [])

  const refrescar = useCallback(async () => {
    if (!authed) return
    setLoading(true)
    try {
      const j = await fetchAnalytics()
      if (!j.ok) {
        setAuthed(false)
        setSummary(null)
        setRecientes([])
        setStorage(undefined)
        return
      }
      aplicarDatos(j)
    } catch {
      setError('No se pudo cargar el panel.')
    } finally {
      setLoading(false)
    }
  }, [authed, aplicarDatos])

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const j = await fetchAnalytics()
      if (cancel) return
      if (j.ok) {
        setAuthed(true)
        aplicarDatos(j)
      }
    })()
    return () => {
      cancel = true
    }
  }, [aplicarDatos])

  useEffect(() => {
    if (!authed) return
    const id = window.setInterval(() => void refrescar(), 5000)
    return () => window.clearInterval(id)
  }, [authed, refrescar])

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const login = await apiLogin(email, password)
      if (!login.ok) {
        setError(login.error || 'Error')
        return
      }
      setPassword('')
      setAuthed(true)
      const j = await fetchAnalytics()
      if (j.ok) aplicarDatos(j)
    } catch {
      setError('No se pudo conectar con el servidor (¿corré npm run dev y tenés .env.local?).')
    } finally {
      setLoading(false)
    }
  }

  const onLogout = async () => {
    await apiLogout()
    setAuthed(false)
    setSummary(null)
    setRecientes([])
    setStorage(undefined)
  }

  return (
    <div className="min-h-screen bg-[#050510] text-[#e8ecff] px-4 py-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#6b7aa8]">Visitas reales</p>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">Estadísticas del sitio</h1>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/"
              className="text-xs font-semibold text-[#8b9fd9] hover:text-white underline-offset-4 hover:underline"
            >
              Volver al simulador
            </Link>
            {authed ? (
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/90 hover:bg-white/10"
              >
                Salir
              </button>
            ) : null}
          </div>
        </header>

        {!authed ? (
          <section className="max-w-md mx-auto rounded-2xl border border-[#2d4a8a]/60 bg-[#0a1024] p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">Ingresá al panel</h2>
            <p className="text-sm text-[#8b9fd9] mb-6">
              Acá ves <strong className="text-[#a8f4ff]">cuánta gente entra</strong> y qué hace: cada visita envía un
              evento al servidor. Las credenciales están solo en variables de entorno (Vercel o <code className="text-[#7ee8fa]">.env.local</code> en
              desarrollo).
            </p>
            <form onSubmit={(e) => void onLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7aa8] mb-1">Email</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#2d4a8a] bg-[#050912] px-3 py-2 text-sm text-white outline-none focus:border-[#5ee7ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7aa8] mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#2d4a8a] bg-[#050912] px-3 py-2 text-sm text-white outline-none focus:border-[#5ee7ff]"
                  required
                />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2d6cdf] py-3 text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-[#3d7cef] disabled:opacity-50"
              >
                {loading ? '…' : 'Entrar'}
              </button>
            </form>
          </section>
        ) : null}

        {authed && summary ? (
          <div className="space-y-10">
            <p className="text-center text-xs text-[#8b9fd9] leading-relaxed max-w-2xl mx-auto">
              {storageLabel(storage)} Se actualiza solo cada unos segundos.
            </p>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7aa8]">Vistas de página</p>
                <p className="text-3xl font-black text-[#7ee8fa] mt-1">{summary.vistasPagina ?? 0}</p>
                <p className="text-[10px] text-[#5e6788] mt-2">Cada vez que alguien abre o cambia de ruta en el sitio.</p>
              </div>
              <div className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7aa8]">Visitantes distintos (aprox.)</p>
                <p className="text-3xl font-black text-[#a8f5c8] mt-1">{summary.visitantesAprox}</p>
                <p className="text-[10px] text-[#5e6788] mt-2">Por IP + navegador (no es login de usuario).</p>
              </div>
              <div className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7aa8]">Eventos totales</p>
                <p className="text-3xl font-black text-[#ffd54f] mt-1">{summary.totalEventos}</p>
                <p className="text-[10px] text-[#5e6788] mt-2">Incluye vistas, clics y otros.</p>
              </div>
            </section>

            <section className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffeb3b] mb-4">Por tipo de evento</h3>
              <ul className="space-y-2 text-sm">
                {filasOrdenadas(summary.porTipo, 20).map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span className="text-[#c8d4ff]">{k}</span>
                    <span className="font-mono text-[#7ee8fa]">{v}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffeb3b] mb-4">Desde dónde entraron (referrer)</h3>
              <ul className="space-y-2 text-sm">
                {filasOrdenadas(summary.porReferrer, 30).map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span className="text-[#c8d4ff] break-all text-left">{k}</span>
                    <span className="font-mono text-[#7ee8fa] shrink-0">{v}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffeb3b] mb-4">Rutas vistas</h3>
              <ul className="space-y-2 text-sm">
                {filasOrdenadas(summary.porRuta, 30).map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span className="font-mono text-[#c8d4ff]">{k}</span>
                    <span className="font-mono text-[#7ee8fa]">{v}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffeb3b] mb-4">Qué tocaron (clics)</h3>
              <ul className="space-y-2 text-sm">
                {filasOrdenadas(summary.clics, 40).map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span className="text-[#c8d4ff] break-all text-left">{k}</span>
                    <span className="font-mono text-[#7ee8fa] shrink-0">{v}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffeb3b] mb-4">Últimos eventos</h3>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#6b7aa8] border-b border-white/10">
                      <th className="py-2 pr-3">Hora</th>
                      <th className="py-2 pr-3">Tipo</th>
                      <th className="py-2 pr-3">Ruta</th>
                      <th className="py-2">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((ev, i) => (
                      <tr key={`${ev.t}-${i}`} className="border-b border-white/5 text-[#c8d4ff]">
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(ev.t).toLocaleString('es-AR')}</td>
                        <td className="py-2 pr-3">{ev.type}</td>
                        <td className="py-2 pr-3 max-w-[140px] truncate">{ev.path}</td>
                        <td className="py-2 max-w-[200px] truncate">{JSON.stringify(ev.meta || {})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {loading && authed ? <p className="text-center text-sm text-[#6b7aa8]">Actualizando…</p> : null}
      </div>
    </div>
  )
}
