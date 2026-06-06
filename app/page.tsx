export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            William Hagen Tools
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Verktøy som jobber<br />for deg
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Personlige verktøy for økonomi, investering og planlegging – bygget for daglig bruk.
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">Tilgjengelige verktøy</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Budsjettplanlegger */}
          <a
            href="/budget"
            className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-zinc-950/50 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-xl">
              💰
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">Budsjettplanlegger</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Interaktiv oversikt over inntekter, utgifter og sparing.</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
              Åpne verktøy
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Placeholder kort */}
          <div className="relative bg-zinc-900/50 border border-zinc-800/50 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[180px]">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-3 text-zinc-600 text-xl">＋</div>
            <p className="text-sm text-zinc-600">Flere verktøy kommer</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/50 max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="text-xs text-zinc-600">William Hagen Tools</span>
        <span className="text-xs text-zinc-700">tools.williamhagen.no</span>
      </div>
    </main>
  );
}
