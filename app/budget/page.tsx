"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "Bolig"
  | "Mat"
  | "Transport"
  | "Underholdning"
  | "Helse"
  | "Klær"
  | "Abonnementer"
  | "Annet";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string;
}

interface SavingsGoal {
  id: string;
    recurring?: boolean;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  icon: string;
}

interface BudgetData {
  monthlyIncome: number;
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
}

type Tab = "dashboard" | "budsjett" | "mål" | "scenario";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "Bolig", "Mat", "Transport", "Underholdning",
  "Helse", "Klær", "Abonnementer", "Annet",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Bolig: "#6366f1",
  Mat: "#f59e0b",
  Transport: "#10b981",
  Underholdning: "#ec4899",
  Helse: "#14b8a6",
  Klær: "#f97316",
  Abonnementer: "#8b5cf6",
  Annet: "#64748b",
};

const GOAL_ICONS = ["🏠", "🚗", "✈️", "💻", "💍", "🎓", "🏦", "⛵"];

const DEFAULT_DATA: BudgetData = {
  monthlyIncome: 52000,
  expenses: [
    { id: "1", name: "Husleie", amount: 14500, category: "Bolig", date: "2024-01-01" },, recurring: true
    { id: "2", name: "Dagligvarer", amount: 4200, category: "Mat", date: "2024-01-05" },
    { id: "3", name: "Kollektivt", amount: 850, category: "Transport", date: "2024-01-02" },, recurring: true
    { id: "4", name: "Netflix / Spotify", amount: 350, category: "Abonnementer", date: "2024-01-01" },, recurring: true
    { id: "5", name: "Treningssenter", amount: 499, category: "Helse", date: "2024-01-01" },, recurring: true
    { id: "6", name: "Restaurant", amount: 1800, category: "Mat", date: "2024-01-12" },
    { id: "7", name: "Klær", amount: 1200, category: "Klær", date: "2024-01-15" },
    { id: "8", name: "Kino / aktiviteter", amount: 600, category: "Underholdning", date: "2024-01-18" },
  ],
  savingsGoals: [
    { id: "g1", name: "Egenkapital bolig", target: 500000, saved: 187000, deadline: "2026-06-01", icon: "🏠" },
    { id: "g2", name: "Drømmeferie Japan", target: 35000, saved: 12400, deadline: "2025-03-01", icon: "✈️" },
    { id: "g3", name: "Ny laptop", target: 18000, saved: 5500, deadline: "2024-12-01", icon: "💻" },
  ],
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatKr(n: number): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

function formatKrCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + " k";
  return n.toFixed(0);
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices, size = 200 }: { slices: DonutSlice[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const ir = size * 0.24;
  const total = slices.reduce((s, x) => s + x.value, 0);
  const [hovered, setHovered] = useState<number | null>(null);

  if (total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={r - ir} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize={size * 0.07}>
          Ingen data
        </text>
      </svg>
    );
  }

  let cumAngle = -Math.PI / 2;
  const paths = slices.map((slice, i) => {
    const frac = slice.value / total;
    const startAngle = cumAngle;
    const endAngle = cumAngle + frac * 2 * Math.PI;
    cumAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(endAngle);
    const iy1 = cy + ir * Math.sin(endAngle);
    const ix2 = cx + ir * Math.cos(startAngle);
    const iy2 = cy + ir * Math.sin(startAngle);
    const large = frac > 0.5 ? 1 : 0;

    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`;
    const scale = hovered === i ? 1.04 : 1;
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const tx = (cx - cx) * (scale - 1) + cx + Math.cos(midAngle) * (scale - 1) * ((r + ir) / 2);
    const ty = (cy - cy) * (scale - 1) + cy + Math.sin(midAngle) * (scale - 1) * ((r + ir) / 2);

    return (
      <path
        key={i}
        d={d}
        fill={slice.color}
        opacity={hovered === null || hovered === i ? 1 : 0.55}
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
      />
    );
  });

  const hovSlice = hovered !== null ? slices[hovered] : null;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {paths}
      <circle cx={cx} cy={cy} r={ir - 2} fill="#0f172a" />
      {hovSlice ? (
        <>
          <text x={cx} y={cy - size * 0.045} textAnchor="middle" fill="#f1f5f9" fontSize={size * 0.065} fontWeight="700">
            {formatKrCompact(hovSlice.value)}
          </text>
          <text x={cx} y={cy + size * 0.045} textAnchor="middle" fill="#94a3b8" fontSize={size * 0.055}>
            {hovSlice.label}
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - size * 0.045} textAnchor="middle" fill="#f1f5f9" fontSize={size * 0.07} fontWeight="800">
            {formatKrCompact(total)}
          </text>
          <text x={cx} y={cy + size * 0.048} textAnchor="middle" fill="#64748b" fontSize={size * 0.055}>
            total
          </text>
        </>
      )}
    </svg>
  );
}

// ─── SVG Trends Chart ────────────────────────────────────────────
interface TrendsDataPoint { month: string; amount: number; }

function TrendsChart({ data, width = 500, height = 200 }: { data: TrendsDataPoint[]; width?: number; height?: number }) {
    if (!data || data.length === 0) return <div className="text-slate-500 text-sm">Ingen trenddata</div>;
    const [hovered, setHovered] = useState<number | null>(null);
    const maxAmount = Math.max(...data.map(d => d.amount)); const padding = 40; const chartHeight = height - padding * 2; const chartWidth = width - padding * 2; const xStep = chartWidth / (data.length - 1); const points = data.map((d, i) => ({ x: padding + i * xStep, y: padding + chartHeight - (d.amount / maxAmount) * chartHeight }));
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '); const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
    return (<svg width={width} height={height} className="overflow-visible"><path d={areaPath} fill="url(#trendGrad)" opacity="0.2" /><path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" />{points.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="transition cursor-pointer" />))}{hovered !== null && (<g><rect x={points[hovered].x - 50} y={points[hovered].y - 45} width="100" height="35" rx="6" fill="#1e293b" stroke="#475569" /><text x={points[hovered].x} y={points[hovered].y - 28} textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="600">{data[hovered].month}</text><text x={points[hovered].x} y={points[hovered].y - 15} textAnchor="middle" fill="#6366f1" fontSize="12" fontWeight="700">{formatKr(data[hovered].amount)}</text></g>)}<defs><linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs></svg>);
  }

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Expense Form ─────────────────────────────────────────────────────────────

interface ExpenseFormProps {
  initial?: Expense;
  onSave: (e: Expense) => void;
  onClose: () => void;
}

function ExpenseForm({ initial, onSave, onClose }: ExpenseFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial?.amount.toString() ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Annet");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));

  const handleSubmit = () => {
    const amt = parseFloat(amount.replace(",", "."));
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      amount: amt,
      category,
      date,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Navn</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="f.eks. Husleie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Beløp (kr)</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="text"
          inputMode="decimal"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Kategori</label>
        <select
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Dato</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          Avbryt
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          {initial ? "Lagre endringer" : "Legg til"}
        </button>
      </div>
    </div>
  );
}

// ─── Goal Form ────────────────────────────────────────────────────────────────

interface GoalFormProps {
  initial?: SavingsGoal;
  onSave: (g: SavingsGoal) => void;
  onClose: () => void;
}

function GoalForm({ initial, onSave, onClose }: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(initial?.target.toString() ?? "");
  const [saved, setSaved] = useState(initial?.saved.toString() ?? "0");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "🏦");

  const handleSubmit = () => {
    const t = parseFloat(target.replace(",", "."));
    const s = parseFloat(saved.replace(",", "."));
    if (!name.trim() || isNaN(t) || t <= 0) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      target: t,
      saved: isNaN(s) ? 0 : s,
      deadline,
      icon,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Mål</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="f.eks. Egenkapital bolig"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-400">Målbeløp (kr)</label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="500000"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-400">Spart hittil (kr)</label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="0"
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
            inputMode="decimal"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Frist</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">Ikon</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                icon === ic
                  ? "bg-indigo-600 ring-2 ring-indigo-400"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          Avbryt
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          {initial ? "Lagre endringer" : "Opprett mål"}
        </button>
      </div>
    </div>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────

function generateInsights(data: BudgetData): { icon: string; text: string; type: "good" | "warn" | "info" }[] {
  const totalExp = data.expenses.reduce((s, e) => s + e.amount, 0);
  const savings = data.monthlyIncome - totalExp;
  const savingsRate = data.monthlyIncome > 0 ? savings / data.monthlyIncome : 0;
  const insights: { icon: string; text: string; type: "good" | "warn" | "info" }[] = [];

  // Savings rate
  if (savingsRate >= 0.2) {
    insights.push({ icon: "🎯", text: `Du sparer ${(savingsRate * 100).toFixed(0)}% av inntekten – over den anbefalte 20%-regelen. Bra jobba!`, type: "good" });
  } else if (savingsRate > 0) {
    insights.push({ icon: "⚠️", text: `Sparerate på ${(savingsRate * 100).toFixed(0)}%. Prøv å nå 20% (${formatKr(data.monthlyIncome * 0.2 - savings)} mer/mnd).`, type: "warn" });
  } else {
    insights.push({ icon: "🚨", text: `Utgiftene overstiger inntekten med ${formatKr(Math.abs(savings))} denne måneden. Ta grep nå.`, type: "warn" });
  }

  // Biggest category
  const byCat: Partial<Record<Category, number>> = {};
  data.expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] ?? 0) + e.amount; });
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    const [topCat, topAmt] = sortedCats[0];
    const pct = totalExp > 0 ? ((topAmt / totalExp) * 100).toFixed(0) : "0";
    insights.push({ icon: "📊", text: `${topCat} er din største utgiftspost (${pct}% av totalen, ${formatKr(topAmt)}/mnd).`, type: "info" });
  }

  // Housing ratio
  const housingAmt = byCat["Bolig"] ?? 0;
  const housingRatio = data.monthlyIncome > 0 ? housingAmt / data.monthlyIncome : 0;
  if (housingRatio > 0.35) {
    insights.push({ icon: "🏠", text: `Boligkostnader utgjør ${(housingRatio * 100).toFixed(0)}% av inntekten. Tommelfingerregelen er maks 30%.`, type: "warn" });
  } else if (housingAmt > 0) {
    insights.push({ icon: "🏠", text: `Boligkostnader på ${(housingRatio * 100).toFixed(0)}% av inntekten – innenfor anbefalt grense.`, type: "good" });
  }

  // Goals progress
  const closeGoals = data.savingsGoals.filter((g) => {
    if (!g.deadline) return false;
    const daysLeft = (new Date(g.deadline).getTime() - Date.now()) / 86400000;
    const pct = g.target > 0 ? g.saved / g.target : 0;
    return daysLeft > 0 && daysLeft < 180 && pct < 0.8;
  });
  if (closeGoals.length > 0) {
    const g = closeGoals[0];
    const remaining = g.target - g.saved;
    const days = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
    const monthly = (remaining / days) * 30;
    insights.push({ icon: "⏳", text: `«${g.name}» mangler ${formatKr(remaining)} – du trenger ${formatKr(Math.round(monthly))}/mnd for å nå fristen.`, type: "warn" });
  }

  // Entertainment
  const entAmt = byCat["Underholdning"] ?? 0;
  if (entAmt > data.monthlyIncome * 0.1) {
    insights.push({ icon: "🎬", text: `Underholdning på ${formatKr(entAmt)}/mnd. Det er ${(entAmt / data.monthlyIncome * 100).toFixed(0)}% av inntekten.`, type: "warn" });
  }

  if (savings > 0) {
    insights.push({ icon: "💡", text: `Med ${formatKr(savings)} i månedlig overskudd kan du bygge ${formatKr(savings * 12)} i sparing per år.`, type: "info" });
  }

  return insights.slice(0, 5);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: string;
}

function StatCard({ label, value, sub, color = "#6366f1", icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 transition hover:border-slate-600">
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}15 0%, transparent 60%)` }}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-bold tracking-tight" style={{ color }}>
          {value}
        </div>
        {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<BudgetData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  // Modals
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Scenario sliders
  const [scenarioSalary, setScenarioSalary] = useState(0);
  const [scenarioExtra, setScenarioExtra] = useState(0);
  const [scenarioCutPct, setScenarioCutPct] = useState(0);

  // Income edit
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");

  // Filter / sort for expense list
  const [filterCat, setFilterCat] = useState<Category | "Alle">("Alle");
  const [sortBy, setSortBy] = useState<"amount" | "date" | "name">("amount");

  // ── Persistence ───────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem("budget-v2");
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetData;
        setData(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("budget-v2", JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, loaded]);

  // ── Derived values ────────────────────────────────────────────────────────

  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const savings = data.monthlyIncome - totalExpenses;
  const savingsRate = data.monthlyIncome > 0 ? (savings / data.monthlyIncome) * 100 : 0;

  const byCat: Partial<Record<Category, number>> = {};
  data.expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] ?? 0) + e.amount; });
  const donutSlices: DonutSlice[] = Object.entries(byCat).map(([cat, val]) => ({
    label: cat,
    value: val,
    color: CATEGORY_COLORS[cat as Category],
  })).sort((a, b) => b.value - a.value);

  const insights = generateInsights(data);

  // Scenario
  const scenIncome = data.monthlyIncome * (1 + scenarioSalary / 100);
  const scenExpenses = totalExpenses * (1 - scenarioCutPct / 100) - scenarioExtra;
  const scenSavings = scenIncome - scenExpenses;
  const scenSavingsYear = scenSavings * 12;
  const currentSavingsYear = savings * 12;
  const scenDiff = scenSavingsYear - currentSavingsYear;

  // Filtered / sorted expenses
  const visibleExpenses = data.expenses
    .filter((e) => filterCat === "Alle" || e.category === filterCat)
    .sort((a, b) => {
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.name.localeCompare(b.name);
    });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const addExpense = useCallback((e: Expense) => {
    setData((d) => ({ ...d, expenses: [...d.expenses, e] }));
  }, []);

  const updateExpense = useCallback((e: Expense) => {
    setData((d) => ({ ...d, expenses: d.expenses.map((x) => x.id === e.id ? e : x) }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
    setDeleteConfirm(null);
  }, []);

  const addGoal = useCallback((g: SavingsGoal) => {
    setData((d) => ({ ...d, savingsGoals: [...d.savingsGoals, g] }));
  }, []);

  const updateGoal = useCallback((g: SavingsGoal) => {
    setData((d) => ({ ...d, savingsGoals: d.savingsGoals.map((x) => x.id === g.id ? g : x) }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, savingsGoals: d.savingsGoals.filter((g) => g.id !== id) }));
    setDeleteConfirm(null);
  }, []);

  const saveIncome = () => {
    const v = parseFloat(incomeInput.replace(/\s/g, "").replace(",", "."));
    if (!isNaN(v) && v > 0) setData((d) => ({ ...d, monthlyIncome: v }));
    setEditingIncome(false);
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "budsjett", label: "Budsjett", icon: "≡" },
    { id: "mål", label: "Mål", icon: "◎" },
    { id: "scenario", label: "Scenario", icon: "⟳" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-slate-500">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black shadow-lg shadow-indigo-500/25">
              ₣
            </div>
            <div>
              <div className="text-base font-bold leading-none tracking-tight">BudsjettPro</div>
              <div className="mt-0.5 text-xs text-slate-500">Personlig økonomi</div>
            </div>
          </div>

          {/* Income display/edit */}
          <div className="flex items-center gap-3">
            {editingIncome ? (
              <div className="flex items-center gap-2">
                <input
                  className="w-36 rounded-lg border border-indigo-500 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 outline-none"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveIncome(); if (e.key === "Escape") setEditingIncome(false); }}
                  autoFocus
                  placeholder="Månedsinntekt"
                />
                <button onClick={saveIncome} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">OK</button>
              </div>
            ) : (
              <button
                onClick={() => { setIncomeInput(data.monthlyIncome.toString()); setEditingIncome(true); }}
                className="group flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 transition hover:border-slate-600"
              >
                <span className="text-xs text-slate-500">Inntekt</span>
                <span className="text-sm font-bold text-emerald-400">{formatKr(data.monthlyIncome)}</span>
                <span className="text-xs text-slate-600 transition group-hover:text-slate-400">✎</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                tab === t.id ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-5xl px-4 py-8">

        {/* ═══════════════════════════════ DASHBOARD ═══════════════════════════════ */}
        {tab === "dashboard" && (
          <div className="space-y-8">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon="💰"
                label="Inntekt"
                value={formatKr(data.monthlyIncome)}
                sub="per måned"
                color="#10b981"
              />
              <StatCard
                icon="📤"
                label="Utgifter"
                value={formatKr(totalExpenses)}
                sub={`${data.expenses.length} poster`}
                color="#f87171"
              />
              <StatCard
                icon="🏦"
                label="Overskudd"
                value={formatKr(savings)}
                sub="denne måneden"
                color={savings >= 0 ? "#6366f1" : "#ef4444"}
              />
              <StatCard
                icon="📈"
                label="Sparerate"
                value={`${Math.max(0, savingsRate).toFixed(1)}%`}
                sub={savingsRate >= 20 ? "Over 20%-målet ✓" : "Mål: 20%"}
                color={savingsRate >= 20 ? "#10b981" : "#f59e0b"}
              />
            </div>

            {/* 💡 FINANCIAL HEALTH SCORE - DOPAMIN RUSH! */}
<div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-6">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-lg font-semibold text-slate-100">💪 Financial Health</h3>
    <div className="text-3xl font-bold" style={{ color: savingsRate >= 20 ? "#10b981" : savingsRate >= 10 ? "#f59e0b" : "#ef4444" }}>
      {Math.min(100, Math.round((savingsRate >= 20 ? 40 : savingsRate * 2) + (data.savingsGoals.filter(g => g.saved >= g.target).length * 20) + (totalExpenses > 0 && totalExpenses < data.monthlyIncome * 0.7 ? 30 : 0)))}/100
    </div>
  </div>
  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
    <div 
      className="h-full transition-all duration-1000 ease-out" 
      style={{ 
        width: `${Math.min(100, Math.round((savingsRate >= 20 ? 40 : savingsRate * 2) + (data.savingsGoals.filter(g => g.saved >= g.target).length * 20) + (totalExpenses > 0 && totalExpenses < data.monthlyIncome * 0.7 ? 30 : 0)))}%`,
        background: savingsRate >= 20 ? "linear-gradient(90deg, #10b981, #059669)" : savingsRate >= 10 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #ef4444, #dc2626)"
      }}
    />
  </div>
  <div className="mt-3 flex gap-2 text-xs text-slate-400">
    <span>✓ Sparerate: {savingsRate.toFixed(0)}%</span>
    <span>✓ Mål: {data.savingsGoals.filter(g => g.saved >= g.target).length}/{data.savingsGoals.length}</span>
  </div>
</div>

            {/* Chart + legend */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 lg:col-span-2">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Fordeling
                </h2>
                <DonutChart slices={donutSlices} size={200} />
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 lg:col-span-3">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Per kategori</h2>
                <div className="space-y-3">
                  {donutSlices.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                          <span className="text-slate-300">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {totalExpenses > 0 ? ((s.value / totalExpenses) * 100).toFixed(0) : 0}%
                          </span>
                          <span className="w-24 text-right font-semibold text-slate-200">
                            {formatKr(s.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${totalExpenses > 0 ? (s.value / totalExpenses) * 100 : 0}%`,
                            background: s.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                          {/* Trends Chart */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 lg:col-span-3">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">SPENDING TRENDS</h2>
            <TrendsChart data={generateTrendsData(totalExpenses)} width={600} height={200} />
          </div>
              </div>
            </div>

            {/* Insights */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                💡 Smarte innsikter
              </h2>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl p-3.5 text-sm ${
                      ins.type === "good"
                        ? "border border-emerald-800/30 bg-emerald-900/20 text-emerald-300"
                        : ins.type === "warn"
                        ? "border border-amber-800/30 bg-amber-900/20 text-amber-300"
                        : "border border-indigo-800/30 bg-indigo-900/20 text-indigo-300"
                    }`}
                  >
                    <span className="mt-0.5 text-base">{ins.icon}</span>
                    <p className="leading-relaxed">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ BUDSJETT ════════════════════════════════ */}
        {tab === "budsjett" && (
          <div className="space-y-6">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value as Category | "Alle")}
                >
                  <option value="Alle">Alle kategorier</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "amount" | "date" | "name")}
                >
                  <option value="amount">Størst beløp</option>
                  <option value="date">Nyeste dato</option>
                  <option value="name">Navn A–Å</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                <span className="text-base leading-none">+</span> Legg til
              </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Totalt", value: formatKr(totalExpenses), color: "text-slate-200" },
                { label: "Viser", value: `${visibleExpenses.length} poster`, color: "text-slate-400" },
                { label: "Synlig sum", value: formatKr(visibleExpenses.reduce((s, e) => s + e.amount, 0)), color: "text-indigo-400" },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-center">
                  <div className="text-xs text-slate-500">{x.label}</div>
                  <div className={`mt-0.5 text-sm font-bold ${x.color}`}>{x.value}</div>
                </div>
              ))}
            </div>

            {/* Expense list */}
            <div className="space-y-2">
              {visibleExpenses.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  Ingen utgifter. Trykk «Legg til» for å starte.
                </div>
              )}
              {visibleExpenses.map((e) => (
                <div
                  key={e.id}
                  className="group flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3.5 transition hover:border-slate-600 hover:bg-slate-800/70"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: CATEGORY_COLORS[e.category] + "33", color: CATEGORY_COLORS[e.category] }}
                  >
                    {e.category.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-200">{e.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-xs font-medium"
                        style={{ background: CATEGORY_COLORS[e.category] + "22", color: CATEGORY_COLORS[e.category] }}
                      >
                        {e.category}
                      </span>
                      <span>{e.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-100">{formatKr(e.amount)}</div>
                    <div className="text-xs text-slate-500">
                      {totalExpenses > 0 ? ((e.amount / totalExpenses) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => setEditingExpense(e)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-700 hover:text-slate-200"
                      title="Rediger"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(e.id)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-900/40 hover:text-red-400"
                      title="Slett"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════ MÅL ════════════════════════════════════ */}
        {tab === "mål" && (
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Sparemål</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {data.savingsGoals.length} aktive mål · Totalt spart{" "}
                  {formatKr(data.savingsGoals.reduce((s, g) => s + g.saved, 0))}
                </p>
              </div>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                <span className="text-base leading-none">+</span> Nytt mål
              </button>
            </div>

            {data.savingsGoals.length === 0 && (
              <div className="py-16 text-center text-slate-500">
                Ingen sparemål enda. Opprett ditt første!
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.savingsGoals.map((g) => {
                const pct = g.target > 0 ? Math.min((g.saved / g.target) * 100, 100) : 0;
                const remaining = g.target - g.saved;
                const daysLeft = g.deadline
                  ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
                  : null;
                const monthsLeft = daysLeft !== null ? daysLeft / 30 : null;
                const monthlyNeeded =
                  monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null;
                const isComplete = pct >= 100;

                return (
                  <div
                    key={g.id}
                    className={`group relative rounded-2xl border p-5 transition ${
                      isComplete
                        ? "border-emerald-700/50 bg-emerald-900/20"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{g.icon}</span>
                        <div>
                          <div className="font-semibold text-slate-100">{g.name}</div>
                          {g.deadline && (
                            <div className={`text-xs ${daysLeft && daysLeft < 60 ? "text-amber-400" : "text-slate-500"}`}>
                              {daysLeft !== null && daysLeft > 0
                                ? `${daysLeft} dager igjen`
                                : daysLeft !== null && daysLeft <= 0
                                ? "Fristen er passert"
                                : g.deadline}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => setEditingGoal(g)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-slate-200"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(`goal-${g.id}`)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-900/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-bold" style={{ color: isComplete ? "#10b981" : "#6366f1" }}>
                          {formatKr(g.saved)}
                        </span>
                        <span className="text-slate-500">av {formatKr(g.target)}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-700/50">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: isComplete
                              ? "linear-gradient(90deg, #10b981, #34d399)"
                              : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className="rounded-full px-2 py-0.5 font-semibold"
                        style={{
                          background: isComplete ? "#10b98120" : "#6366f120",
                          color: isComplete ? "#10b981" : "#818cf8",
                        }}
                      >
                        {isComplete ? "✓ Fullført!" : `${pct.toFixed(1)}% fullført`}
                      </span>
                      {!isComplete && monthlyNeeded && (
                        <span className="text-slate-500">
                          Trenger {formatKr(Math.round(monthlyNeeded))}/mnd
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════ SCENARIO ══════════════════════════════════ */}
        {tab === "scenario" && (
          <div className="space-y-6">

            <div>
              <h2 className="text-lg font-bold text-slate-100">Scenarioanalyse</h2>
              <p className="mt-1 text-sm text-slate-500">
                Utforsk hva som skjer med sparingen din ved ulike endringer.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Sliders */}
              <div className="space-y-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Juster parametre</h3>

                {/* Salary increase */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Lønnsøkning</label>
                    <span className="rounded-lg bg-emerald-900/40 px-2.5 py-1 text-sm font-bold text-emerald-400">
                      +{scenarioSalary}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={scenarioSalary}
                    onChange={(e) => setScenarioSalary(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-600">
                    <span>0%</span>
                    <span>+{formatKr(Math.round(data.monthlyIncome * scenarioSalary / 100))}/mnd</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Extra savings */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Ekstra månedssparing</label>
                    <span className="rounded-lg bg-indigo-900/40 px-2.5 py-1 text-sm font-bold text-indigo-400">
                      {formatKr(scenarioExtra)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    value={scenarioExtra}
                    onChange={(e) => setScenarioExtra(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-600">
                    <span>0 kr</span>
                    <span>15 000 kr</span>
                  </div>
                </div>

                {/* Cut expenses */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Kutt i utgifter</label>
                    <span className="rounded-lg bg-rose-900/40 px-2.5 py-1 text-sm font-bold text-rose-400">
                      -{scenarioCutPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    value={scenarioCutPct}
                    onChange={(e) => setScenarioCutPct(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-600">
                    <span>0%</span>
                    <span>-{formatKr(Math.round(totalExpenses * scenarioCutPct / 100))}/mnd</span>
                    <span>50%</span>
                  </div>
                </div>

                <button
                  onClick={() => { setScenarioSalary(0); setScenarioExtra(0); setScenarioCutPct(0); }}
                  className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                >
                  Nullstill scenario
                </button>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-indigo-700/40 bg-indigo-900/20 p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-400">Nytt scenario</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Månedsinntekt", current: data.monthlyIncome, next: Math.round(scenIncome), color: "#10b981" },
                      { label: "Månedlige utgifter", current: totalExpenses, next: Math.round(Math.max(0, scenExpenses)), color: "#f87171" },
                      { label: "Månedlig sparing", current: savings, next: Math.round(scenSavings), color: "#6366f1" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{row.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 line-through">{formatKr(row.current)}</span>
                          <span className="font-bold" style={{ color: row.color }}>{formatKr(row.next)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 text-center">
                    <div className="text-xs text-slate-500">Årlig sparing (nå)</div>
                    <div className="mt-1 text-xl font-bold text-slate-300">{formatKr(currentSavingsYear)}</div>
                  </div>
                  <div className="rounded-2xl border border-indigo-700/40 bg-indigo-900/20 p-4 text-center">
                    <div className="text-xs text-indigo-400">Årlig sparing (scenario)</div>
                    <div className="mt-1 text-xl font-bold text-indigo-300">{formatKr(Math.round(scenSavingsYear))}</div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl p-5 text-center ${
                    scenDiff > 0
                      ? "border border-emerald-700/40 bg-emerald-900/20"
                      : "border border-slate-700/50 bg-slate-800/30"
                  }`}
                >
                  <div className="text-sm text-slate-400">Endring i årlig sparing</div>
                  <div
                    className={`mt-1 text-3xl font-black tracking-tight ${
                      scenDiff > 0 ? "text-emerald-400" : scenDiff < 0 ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {scenDiff > 0 ? "+" : ""}{formatKr(Math.round(scenDiff))}
                  </div>
                  {scenDiff > 0 && (
                    <div className="mt-2 text-xs text-emerald-500">
                      Over 10 år: {formatKr(Math.round(scenDiff * 10))} ekstra
                    </div>
                  )}
                </div>

                {/* Goal projection */}
                {data.savingsGoals.length > 0 && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Innvirkning på mål
                    </h4>
                    {data.savingsGoals.slice(0, 3).map((g) => {
                      const remaining = g.target - g.saved;
                      const currentMonths = savings > 0 ? Math.ceil(remaining / savings) : null;
                      const scenMonths = scenSavings > 0 ? Math.ceil(remaining / scenSavings) : null;
                      const diff = currentMonths !== null && scenMonths !== null ? currentMonths - scenMonths : null;
                      return (
                        <div key={g.id} className="mb-3 flex items-center justify-between text-sm last:mb-0">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span>{g.icon}</span> {g.name}
                          </span>
                          {diff !== null && diff > 0 ? (
                            <span className="font-semibold text-emerald-400">{diff} mnd raskere</span>
                          ) : scenMonths !== null ? (
                            <span className="text-slate-500">om {scenMonths} mnd</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Modals ── */}

      {showAddExpense && (
        <Modal title="Legg til utgift" onClose={() => setShowAddExpense(false)}>
          <ExpenseForm onSave={addExpense} onClose={() => setShowAddExpense(false)} />
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Rediger utgift" onClose={() => setEditingExpense(null)}>
          <ExpenseForm
            initial={editingExpense}
            onSave={updateExpense}
            onClose={() => setEditingExpense(null)}
          />
        </Modal>
      )}

      {showAddGoal && (
        <Modal title="Opprett sparemål" onClose={() => setShowAddGoal(false)}>
          <GoalForm onSave={addGoal} onClose={() => setShowAddGoal(false)} />
        </Modal>
      )}

      {editingGoal && (
        <Modal title="Rediger sparemål" onClose={() => setEditingGoal(null)}>
          <GoalForm
            initial={editingGoal}
            onSave={updateGoal}
            onClose={() => setEditingGoal(null)}
          />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Bekreft sletting"
          onClose={() => setDeleteConfirm(null)}
        >
          <p className="mb-6 text-slate-400">
            Er du sikker på at du vil slette dette? Handlingen kan ikke angres.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800"
            >
              Avbryt
            </button>
            <button
              onClick={() => {
                if (deleteConfirm.startsWith("goal-")) {
                  deleteGoal(deleteConfirm.replace("goal-", ""));
                } else {
                  deleteExpense(deleteConfirm);
                }
              }}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Slett
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
