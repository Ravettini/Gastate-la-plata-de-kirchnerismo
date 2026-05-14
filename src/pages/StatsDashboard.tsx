import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  closeDashboardSession,
  DASHBOARD_EMAIL,
  isDashboardSessionOpen,
  loadAnalyticsFromStorage,
  tryDashboardLogin,
  type AnalyticsEvent,
  type AnalyticsSummary,
} from '../lib/dashboardTrack'

function filasOrdenadas(obj: Record<string, number>, limite = 25) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
}

export function StatsDashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(() => isDashboardSessionOpen())
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [recientes, setRecientes] = useState<AnalyticsEvent[]>([])

  const refrescar = useCallback(() => {
    if (!isDashboardSessionOpen()) return
    const { summary: s, recientes: r } = loadAnalyticsFromStorage()
    setSummary(s)
    setRecientes(r)
  }, [])

  useEffect(() => {
    if (isDashboardSessionOpen()) {
      setAuthed(true)
      refrescar()
    }
  }, [refrescar])

  useEffect(() => {
    if (!authed) return
    const id = window.setInterval(() => refrescar(), 4000)
    return () => window.clearInterval(id)
  }, [authed, refrescar])

  const onLogin = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (tryDashboardLogin(email, password)) {
      setPassword('')
      setAuthed(true)
      refrescar()
    } else {
      setError('Credenciales incorrectas.')
    }
  }

  const onLogout = () => {
    closeDashboardSession()
    setAuthed(false)
    setSummary(null)
    setRecientes([])
  }

  return (
    <div className="min-h-screen bg-[#050510] text-[#e8ecff] px-4 py-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#6b7aa8]">Panel local</p>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">Estadísticas de visitas</h1>
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
                onClick={onLogout}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/90 hover:bg-white/10"
              >
                Salir
              </button>
            ) : null}
          </div>
        </header>

        {!authed ? (
          <section className="max-w-md mx-auto rounded-2xl border border-[#2d4a8a]/60 bg-[#0a1024] p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">Ingresá</h2>
            <p className="text-sm text-[#8b9fd9] mb-6">
              Sin servidor: los datos se guardan en <strong className="text-[#a8c4ff]">localStorage</strong> de este
              navegador (solo lo que pasa acá). Las credenciales están en el código del front.
            </p>
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7aa8] mb-1">Email</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DASHBOARD_EMAIL}
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
                className="w-full rounded-xl bg-[#2d6cdf] py-3 text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-[#3d7cef]"
              >
                Entrar
              </button>
            </form>
          </section>
        ) : null}

        {authed && summary ? (
          <div className="space-y-10">
            <p className="text-center text-xs text-[#6b7aa8]">
              Datos de este navegador solamente. Se actualizan solos cada unos segundos.
            </p>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7aa8]">Eventos registrados</p>
                <p className="text-3xl font-black text-[#7ee8fa] mt-1">{summary.totalEventos}</p>
              </div>
              <div className="rounded-xl border border-[#2d4a8a]/50 bg-[#0a1024] p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7aa8]">
                  IDs de sesión (navegador)
                </p>
                <p className="text-3xl font-black text-[#a8f5c8] mt-1">{summary.visitantesAprox}</p>
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

        {authed && summary && summary.totalEventos === 0 ? (
          <p className="text-center text-[#8b9fd9] mt-8">Navegá el sitio en esta misma pestaña/navegador para acumular eventos.</p>
        ) : null}
      </div>
    </div>
  )
}
