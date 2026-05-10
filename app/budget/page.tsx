"use client";

// FIX 1: Removed unused `useRef` import
import { useEffect, useState } from "react";

// FIX 2: Added `category` field for robust insight matching
type ExpenseCategory =
  | "housing"
  | "utilities"
  | "insurance"
  | "internet"
  | "subscriptions"
  | "car_loan"
  | "groceries"
  | "transport"
  | "clothing"
  | "leisure"
  | "personal_care"
  | "misc"
  | "other";

type Expense = {
  id: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
};

// FIX 3: Clamp helper to prevent negative/overflowing progress bars
const clampPercent = (value: number) =>
  Math.min(100, Math.max(0, value));

// FIX 6: Safe localStorage helpers with try/catch
function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    console.warn(`Failed to load "${key}" from localStorage`);
    return null;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to save "${key}" to localStorage`);
  }
}

const DEFAULT_FIXED: Expense[] = [
  { id: 1, name: "Boliglån / Husleie",      amount: 12000, category: "housing" },
  { id: 2, name: "Strøm",                    amount: 1500,  category: "utilities" },
  { id: 3, name: "Forsikringer",             amount: 1800,  category: "insurance" },
  { id: 4, name: "Internett & mobil",        amount: 899,   category: "internet" },
  { id: 5, name: "Streaming / abonnementer", amount: 499,   category: "subscriptions" },
  { id: 6, name: "Billån",                   amount: 3500,  category: "car_loan" },
];

const DEFAULT_VARIABLE: Expense[] = [
  { id: 1, name: "Mat og dagligvarer",    amount: 5500, category: "groceries" },
  { id: 2, name: "Transport",             amount: 2500, category: "transport" },
  { id: 3, name: "Klær og sko",           amount: 1200, category: "clothing" },
  { id: 4, name: "Fritid og restaurant",  amount: 3500, category: "leisure" },
  { id: 5, name: "Personlig pleie",       amount: 800,  category: "personal_care" },
  { id: 6, name: "Diverse småkjøp",       amount: 1000, category: "misc" },
];

export default function BudgetPage() {
  const [income, setIncome] = useState<number>(45000);
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([]);
  const [variableExpenses, setVariableExpenses] = useState<Expense[]>([]);

  /* LOAD */
  useEffect(() => {
    setIncome(loadFromStorage<number>("income") ?? 45000);
    setFixedExpenses(loadFromStorage<Expense[]>("fixedExpenses") ?? DEFAULT_FIXED);
    setVariableExpenses(loadFromStorage<Expense[]>("variableExpenses") ?? DEFAULT_VARIABLE);
  }, []);

  // FIX 5: Single combined save effect instead of three separate ones
  useEffect(() => {
    saveToStorage("income", income);
    saveToStorage("fixedExpenses", fixedExpenses);
    saveToStorage("variableExpenses", variableExpenses);
  }, [income, fixedExpenses, variableExpenses]);

  /* UPDATE */
  const updateExpense = (
    type: "fixed" | "variable",
    id: number,
    field: "name" | "amount",
    value: string
  ) => {
    const setter = type === "fixed" ? setFixedExpenses : setVariableExpenses;
    setter((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? { ...expense, [field]: field === "amount" ? Number(value) : value }
          : expense
      )
    );
  };

  /* ADD */
  const addExpense = (type: "fixed" | "variable") => {
    const newExpense: Expense = {
      id: Date.now(),
      name: "Ny kategori",
      amount: 0,
      category: "other",
    };
    if (type === "fixed") {
      setFixedExpenses((prev) => [...prev, newExpense]);
    } else {
      setVariableExpenses((prev) => [...prev, newExpense]);
    }
  };

  /* REMOVE */
  const removeExpense = (type: "fixed" | "variable", id: number) => {
    if (type === "fixed") {
      setFixedExpenses((prev) => prev.filter((e) => e.id !== id));
    } else {
      setVariableExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  /* TOTALS */
  const calculateTotal = (expenses: Expense[]) =>
    expenses.reduce((sum, e) => sum + e.amount, 0);

  const fixedTotal = calculateTotal(fixedExpenses);
  const variableTotal = calculateTotal(variableExpenses);
  const totalExpenses = fixedTotal + variableTotal;
  const remaining = income - totalExpenses;

  const savingsRate =
    income > 0 ? ((remaining / income) * 100).toFixed(1) : "0";

  const calculatePercentage = (amount: number) =>
    income > 0 ? ((amount / income) * 100).toFixed(1) : "0";

  // FIX 2: Insights now use `category` instead of fragile string matching
  const housingExpense =
    fixedExpenses.find((e) => e.category === "housing")?.amount ?? 0;
  const housingPercent = income > 0 ? (housingExpense / income) * 100 : 0;

  const leisureExpense =
    variableExpenses.find((e) => e.category === "leisure")?.amount ?? 0;

  // FIX 4: Improved PDF export with a dedicated print stylesheet hint
  // For a true PDF, consider libraries like jsPDF or react-pdf in a real project.
  // window.print() is kept here but a <style media="print"> in your global CSS
  // should hide the nav, buttons, and inputs for a clean result.
  const exportPDF = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 mb-3">
              Budsjettplanlegger
            </h1>
            <p className="text-zinc-700 text-xl">
              Bygg oversikt over økonomien din.
            </p>
          </div>
          <button
            onClick={exportPDF}
            className="bg-zinc-900 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-zinc-700 transition"
          >
            Eksporter PDF
          </button>
        </div>

        {/* TOP CARDS */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">Inntekt</h2>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full p-4 rounded-2xl border border-zinc-300 text-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-700 mb-3">Totale utgifter</h2>
            <div className="text-4xl font-black text-zinc-900">
              {totalExpenses.toLocaleString("nb-NO")} kr
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-700 mb-3">Til overs</h2>
            <div className={`text-4xl font-black ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              {remaining.toLocaleString("nb-NO")} kr
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-700 mb-3">Sparerate</h2>
            <div className="text-4xl font-black text-zinc-900">{savingsRate}%</div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 mb-6">
          <h2 className="text-2xl font-black mb-5">Økonomiske innsikter</h2>
          <div className="space-y-3">
            {housingPercent > 35 && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                Boligkostnadene dine er over 35% av inntekten.
              </div>
            )}
            {Number(savingsRate) >= 20 && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4">
                Du har en sterk sparerate på {savingsRate}%.
              </div>
            )}
            {leisureExpense > remaining && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl p-4">
                Fritidsforbruket overstiger det du sitter igjen med.
              </div>
            )}
            {remaining < 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                Du bruker mer penger enn du tjener.
              </div>
            )}
          </div>
        </div>

        {/* CHART */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 mb-6">
          <h2 className="text-2xl font-black mb-6">Fordeling av økonomi</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Faste kostnader</span>
                <span>{calculatePercentage(fixedTotal)}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-4">
                {/* FIX 3: width is clamped so it's always a valid CSS value */}
                <div
                  className="bg-zinc-900 h-4 rounded-full"
                  style={{ width: `${clampPercent(Number(calculatePercentage(fixedTotal)))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Variable kostnader</span>
                <span>{calculatePercentage(variableTotal)}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-zinc-500 h-4 rounded-full"
                  style={{ width: `${clampPercent(Number(calculatePercentage(variableTotal)))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Sparing</span>
                <span>{savingsRate}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${clampPercent(Number(savingsRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EXPENSES */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* FIXED */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-zinc-900">Faste kostnader</h2>
              <button
                onClick={() => addExpense("fixed")}
                className="w-11 h-11 rounded-2xl bg-zinc-900 text-white text-2xl font-bold hover:bg-zinc-700 transition"
              >
                +
              </button>
            </div>
            <div className="space-y-4">
              {fixedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[1fr_140px_80px_50px] gap-3 items-center"
                >
                  <input
                    type="text"
                    value={expense.name}
                    onChange={(e) => updateExpense("fixed", expense.id, "name", e.target.value)}
                    className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => updateExpense("fixed", expense.id, "amount", e.target.value)}
                    className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <div className="text-sm font-bold text-zinc-600 text-right">
                    {calculatePercentage(expense.amount)}%
                  </div>
                  <button
                    onClick={() => removeExpense("fixed", expense.id)}
                    className="rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* VARIABLE */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-zinc-900">Variable kostnader</h2>
              <button
                onClick={() => addExpense("variable")}
                className="w-11 h-11 rounded-2xl bg-zinc-900 text-white text-2xl font-bold hover:bg-zinc-700 transition"
              >
                +
              </button>
            </div>
            <div className="space-y-4">
              {variableExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[1fr_140px_80px_50px] gap-3 items-center"
                >
                  <input
                    type="text"
                    value={expense.name}
                    onChange={(e) => updateExpense("variable", expense.id, "name", e.target.value)}
                    className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => updateExpense("variable", expense.id, "amount", e.target.value)}
                    className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <div className="text-sm font-bold text-zinc-600 text-right">
                    {calculatePercentage(expense.amount)}%
                  </div>
                  <button
                    onClick={() => removeExpense("variable", expense.id)}
                    className="rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}