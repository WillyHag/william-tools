export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-8">
      <div className="max-w-3xl text-center">

        <h1 className="text-5xl font-bold tracking-tight mb-6">
          William Hagen Tools
        </h1>

        <p className="text-xl text-zinc-600 mb-10 leading-relaxed">
          Verktøy for personlig økonomi, investering og systemer.
        </p>

        <div className="grid gap-4">

          <a
            href="/budget"
            className="bg-white hover:bg-zinc-50 transition border border-zinc-200 rounded-2xl p-6 text-left shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Budsjettplanlegger
            </h2>

            <p className="text-zinc-600">
              Interaktiv oversikt over inntekter, utgifter og sparing.
            </p>
          </a>

        </div>

      </div>
    </main>
  );
}
