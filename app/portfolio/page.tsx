"use client";

import { useState } from "react";

interface Stock {
  id: string;
  name: string;
  ticker: string;
  percentage: number;
  status: "Bygger" | "Holder";
  category: string;
}

const INITIAL_STOCKS: Stock[] = [
  {
    id: "1",
    name: "Constellation Energy",
    ticker: "CEG",
    percentage: 19.93,
    status: "Bygger",
    category: "Energi / kraft",
  },
  {
    id: "2",
    name: "NVIDIA",
    ticker: "NVDA",
    percentage: 19.77,
    status: "Bygger",
    category: "AI / halvledere",
  },
  {
    id: "3",
    name: "Vistra Corp",
    ticker: "VST",
    percentage: 13.97,
    status: "Bygger",
    category: "Energi",
  },
  {
    id: "4",
    name: "Alphabet",
    ticker: "GOOGL",
    percentage: 12.86,
    status: "Holder",
    category: "Tech / AI",
  },
  {
    id: "5",
    name: "Taiwan Semiconductor",
    ticker: "TSM",
    percentage: 12.85,
    status: "Bygger",
    category: "Chip-produksjon",
  },
  {
    id: "6",
    name: "Vertiv Holdings",
    ticker: "VRT",
    percentage: 12.46,
    status: "Bygger",
    category: "Datacenter",
  },
];

export default function PortfolioPage() {
  const [stocks] = useState<Stock[]>(INITIAL_STOCKS);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950 text-white">
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Fokus: AI, energi og infrastruktur
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Porteføljen min
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Dette er et konkret eksempel på en investeringsportefølje jeg bygger fra vanlig inntekt.
            Jeg viser hva jeg eier, hvordan det er fordelt, og hvordan det utvikler seg over tid.
          </p>
          <p className="text-lg text-zinc-500 mt-4">
            Oppdatert: April 2026
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-8">Enkeltaksjer</h2>
        <p className="text-zinc-400 mb-8">
          Dette er den aktive delen av porteføljen min, hvor jeg tar høyere risiko.
        </p>
        <p className="text-sm text-zinc-500 mb-12">
          Fokus: AI, energi og infrastruktur
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-zinc-900/50"
            >
              <h3 className="text-xl font-semibold mb-2">
                {stock.name} ({stock.ticker})
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-zinc-400">Andel:</span>{" "}
                  <span className="text-white font-medium">{stock.percentage}%</span>
                </p>
                <p className="text-sm">
                  <span className="text-zinc-400">Status:</span>{" "}
                  <span className="text-white font-medium">{stock.status}</span>
                </p>
                <p className="text-sm text-zinc-400">{stock.category}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 mb-4">
            Jeg bygger posisjoner gradvis, med mål om langsiktig vekst.
          </p>
          <p className="text-sm text-zinc-500">
            Store deler av aksjede len er eksponert mot samme makrotrend:
            økende behov for AI → økende behov for datakraft → økende behov for strøm og infrastruktur
          </p>
          <p className="text-sm text-zinc-500 mt-4">
            Dette gir høy oppside, men også høy risiko.
          </p>
        </div>
      </div>
    </main>
  );
}
