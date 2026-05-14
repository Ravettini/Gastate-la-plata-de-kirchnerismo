import { Link } from 'react-router-dom'
import { cases } from '../data/cases'
import { CauseCard } from '../components/CauseCard'
import { SealLogo } from '../components/SealLogo'

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[#080912] text-[#f4f4f7] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-5 sm:px-10 pt-16 sm:pt-24 pb-20">
        <header className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="flex justify-center mb-10">
            <SealLogo size={56} className="text-[11px]" />
          </div>
          <p className="eyebrow text-[#8b8da5]">Simulador de montos públicos</p>
          <h1 className="massive-number mt-6 text-[#f5f5fa] tracking-tighter px-2">
            GASTA LA PLATA DEL KIRCHNERISMO
          </h1>
          <p className="mt-8 text-sm sm:text-base text-[#8b8da5] leading-relaxed max-w-xl mx-auto px-2">
            Un simulador para dimensionar la corrupcion cometida por los gobiernos kirchneristas.
          </p>
          <p className="mt-8 text-[11px] font-semibold tracking-[0.28em] text-[#5e6078] uppercase">
            Elegí una causa y tratá de gastar el monto completo.
          </p>
          <p className="mt-6 text-base sm:text-lg font-black tracking-[0.4em] text-[#F6C445]" aria-hidden="true">
            O
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/juegos/enterrarla-toda"
              className="inline-flex items-center justify-center rounded-xl border border-[#F6C445]/50 bg-[#F6C445]/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#F6C445] hover:bg-[#F6C445]/20 hover:border-[#F6C445] transition-colors"
            >
              JUGA A ENTERRALA TODA
            </Link>
            <a
              href="/juegos/lleva-larreta-planeta/index.html"
              className="inline-flex items-center justify-center rounded-xl border border-[#7ee8fa]/45 bg-[#7ee8fa]/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#b8f4ff] hover:bg-[#7ee8fa]/18 hover:border-[#7ee8fa] transition-colors"
            >
              LLEVA A LARRETA A SU PLANETA
            </a>
            <Link
              to="/juegos/metro-gondola"
              className="inline-flex items-center justify-center rounded-xl border border-[#c41e3a]/50 bg-[#c41e3a]/12 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#ffb3c0] hover:bg-[#c41e3a]/22 hover:border-[#ffeb3b] transition-colors"
            >
              JUGAR AL MEDIDOR DE GÓNDOLAS
            </Link>
          </div>
          <div
            className="mt-10 sm:mt-12 flex flex-col items-center gap-1.5 text-[#5e6078]"
            role="note"
            aria-label="Indicación: hay más contenido hacia abajo"
          >
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em]">
              Deslizá para ver las causas
            </span>
            <span
              className="text-xl leading-none text-[#2f80ff] motion-safe:animate-bounce"
              aria-hidden="true"
            >
              ↓
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {cases.map((c) => (
            <CauseCard key={c.id} caseData={c} />
          ))}
        </div>

        <footer className="mt-24 sm:mt-32 text-center max-w-2xl mx-auto">
          <div className="thin-divider mb-8" />
          <p className="text-[11px] sm:text-xs leading-relaxed text-[#5e6078] tracking-wide">
            Los montos son aproximados y editables. En causas judiciales pueden representar perjuicio estimado, decomiso, dinero secuestrado o embargos. En campañas y pauta, gasto declarado o relevado.
          </p>
        </footer>
      </div>
    </div>
  )
}
