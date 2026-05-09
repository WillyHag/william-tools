"use client";

import { useEffect, useRef, useState } from "react";


type Expense = {
  id: number;
  name: string;
  amount: number;
};

export default function BudgetPage() {

  const [income, setIncome] = useState<number>(45000);

  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([]);

  const [variableExpenses, setVariableExpenses] = useState<Expense[]>([]);

  /* LOAD */

  useEffect(() => {
    const savedIncome =
      localStorage.getItem("income");

    const savedFixed =
      localStorage.getItem("fixedExpenses");

    const savedVariable =
      localStorage.getItem("variableExpenses");

    if (savedIncome) {
      setIncome(JSON.parse(savedIncome));
    }

    if (savedFixed) {
      setFixedExpenses(JSON.parse(savedFixed));
    } else {
      setFixedExpenses([
  {
    id: 1,
    name: "Boliglån / Husleie",
    amount: 12000,
  },
  {
    id: 2,
    name: "Strøm",
    amount: 1500,
  },
  {
    id: 3,
    name: "Forsikringer",
    amount: 1800,
  },
  {
    id: 4,
    name: "Internett & mobil",
    amount: 899,
  },
  {
    id: 5,
    name: "Streaming / abonnementer",
    amount: 499,
  },
  {
    id: 6,
    name: "Billån",
    amount: 3500,
  },
]);
    }

    if (savedVariable) {
      setVariableExpenses(JSON.parse(savedVariable));
    } else {
      setVariableExpenses([
  {
    id: 1,
    name: "Mat og dagligvarer",
    amount: 5500,
  },
  {
    id: 2,
    name: "Transport",
    amount: 2500,
  },
  {
    id: 3,
    name: "Klær og sko",
    amount: 1200,
  },
  {
    id: 4,
    name: "Fritid og restaurant",
    amount: 3500,
  },
  {
    id: 5,
    name: "Personlig pleie",
    amount: 800,
  },
  {
    id: 6,
    name: "Diverse småkjøp",
    amount: 1000,
  },
]);
    }
  }, []);

  /* SAVE */

  useEffect(() => {
    localStorage.setItem(
      "income",
      JSON.stringify(income)
    );
  }, [income]);

  useEffect(() => {
    localStorage.setItem(
      "fixedExpenses",
      JSON.stringify(fixedExpenses)
    );
  }, [fixedExpenses]);

  useEffect(() => {
    localStorage.setItem(
      "variableExpenses",
      JSON.stringify(variableExpenses)
    );
  }, [variableExpenses]);

  /* UPDATE */

  const updateExpense = (
    type: "fixed" | "variable",
    id: number,
    field: "name" | "amount",
    value: string
  ) => {
    const updater =
      type === "fixed"
        ? setFixedExpenses
        : setVariableExpenses;

    const current =
      type === "fixed"
        ? fixedExpenses
        : variableExpenses;

    updater(
      current.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              [field]:
                field === "amount"
                  ? Number(value)
                  : value,
            }
          : expense
      )
    );
  };

  /* ADD */

  const addExpense = (
    type: "fixed" | "variable"
  ) => {
    const newExpense = {
      id: Date.now(),
      name: "Ny kategori",
      amount: 0,
    };

    if (type === "fixed") {
      setFixedExpenses([
        ...fixedExpenses,
        newExpense,
      ]);
    } else {
      setVariableExpenses([
        ...variableExpenses,
        newExpense,
      ]);
    }
  };

  /* REMOVE */

  const removeExpense = (
    type: "fixed" | "variable",
    id: number
  ) => {
    if (type === "fixed") {
      setFixedExpenses(
        fixedExpenses.filter(
          (expense) => expense.id !== id
        )
      );
    } else {
      setVariableExpenses(
        variableExpenses.filter(
          (expense) => expense.id !== id
        )
      );
    }
  };

  /* TOTALS */

  const calculateTotal = (
    expenses: Expense[]
  ) =>
    expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

  const fixedTotal =
    calculateTotal(fixedExpenses);

  const variableTotal =
    calculateTotal(variableExpenses);

  const totalExpenses =
    fixedTotal + variableTotal;

  const remaining =
    income - totalExpenses;

  const savingsRate =
    income > 0
      ? (
          (remaining / income) *
          100
        ).toFixed(1)
      : "0";

  const calculatePercentage = (
    amount: number
  ) => {
    if (income === 0) return "0";

    return (
      (amount / income) *
      100
    ).toFixed(1);
  };

  /* INSIGHTS */

  const housingExpense =
    fixedExpenses.find((expense) =>
      expense.name
        .toLowerCase()
        .includes("bolig")
    )?.amount || 0;

  const housingPercent =
    Number(
      calculatePercentage(
        housingExpense
      )
    );

  const leisureExpense =
    variableExpenses.find((expense) =>
      expense.name
        .toLowerCase()
        .includes("fritid")
    )?.amount || 0;

  /* PDF */

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

            <h2 className="text-lg font-semibold text-zinc-800 mb-4">
              Inntekt
            </h2>

            <input
              type="number"
              value={income}
              onChange={(e) =>
                setIncome(
                  Number(e.target.value)
                )
              }
              className="w-full p-4 rounded-2xl border border-zinc-300 text-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">

            <h2 className="text-lg font-semibold text-zinc-700 mb-3">
              Totale utgifter
            </h2>

            <div className="text-4xl font-black text-zinc-900">
              {totalExpenses.toLocaleString(
                "nb-NO"
              )}{" "}
              kr
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">

            <h2 className="text-lg font-semibold text-zinc-700 mb-3">
              Til overs
            </h2>

            <div
              className={`text-4xl font-black ${
                remaining >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {remaining.toLocaleString(
                "nb-NO"
              )}{" "}
              kr
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">

            <h2 className="text-lg font-semibold text-zinc-700 mb-3">
              Sparerate
            </h2>

            <div className="text-4xl font-black text-zinc-900">
              {savingsRate}%
            </div>
          </div>

        </div>

        {/* INSIGHTS */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 mb-6">

          <h2 className="text-2xl font-black mb-5">
            Økonomiske innsikter
          </h2>

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

        {/* SIMPLE CHART */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 mb-6">

          <h2 className="text-2xl font-black mb-6">
            Fordeling av økonomi
          </h2>

          <div className="space-y-4">

            <div>
              <div className="flex justify-between mb-2">
                <span>Faste kostnader</span>
                <span>
                  {calculatePercentage(
                    fixedTotal
                  )}
                  %
                </span>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-zinc-900 h-4 rounded-full"
                  style={{
                    width: `${calculatePercentage(
                      fixedTotal
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Variable kostnader</span>
                <span>
                  {calculatePercentage(
                    variableTotal
                  )}
                  %
                </span>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-zinc-500 h-4 rounded-full"
                  style={{
                    width: `${calculatePercentage(
                      variableTotal
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Sparing</span>
                <span>
                  {savingsRate}%
                </span>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{
                    width: `${savingsRate}%`,
                  }}
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

              <h2 className="text-3xl font-black text-zinc-900">
                Faste kostnader
              </h2>

              <button
                onClick={() =>
                  addExpense("fixed")
                }
                className="w-11 h-11 rounded-2xl bg-zinc-900 text-white text-2xl font-bold hover:bg-zinc-700 transition"
              >
                +
              </button>

            </div>

            <div className="space-y-4">

              {fixedExpenses.map(
                (expense) => (

                  <div
                    key={expense.id}
                    className="grid grid-cols-[1fr_140px_80px_50px] gap-3 items-center"
                  >

                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) =>
                        updateExpense(
                          "fixed",
                          expense.id,
                          "name",
                          e.target.value
                        )
                      }
                      className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />

                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        updateExpense(
                          "fixed",
                          expense.id,
                          "amount",
                          e.target.value
                        )
                      }
                      className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />

                    <div className="text-sm font-bold text-zinc-600 text-right">
                      {calculatePercentage(
                        expense.amount
                      )}
                      %
                    </div>

                    <button
                      onClick={() =>
                        removeExpense(
                          "fixed",
                          expense.id
                        )
                      }
                      className="rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

          {/* VARIABLE */}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-3xl font-black text-zinc-900">
                Variable kostnader
              </h2>

              <button
                onClick={() =>
                  addExpense("variable")
                }
                className="w-11 h-11 rounded-2xl bg-zinc-900 text-white text-2xl font-bold hover:bg-zinc-700 transition"
              >
                +
              </button>

            </div>

            <div className="space-y-4">

              {variableExpenses.map(
                (expense) => (

                  <div
                    key={expense.id}
                    className="grid grid-cols-[1fr_140px_80px_50px] gap-3 items-center"
                  >

                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) =>
                        updateExpense(
                          "variable",
                          expense.id,
                          "name",
                          e.target.value
                        )
                      }
                      className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />

                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        updateExpense(
                          "variable",
                          expense.id,
                          "amount",
                          e.target.value
                        )
                      }
                      className="p-3 rounded-2xl border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />

                    <div className="text-sm font-bold text-zinc-600 text-right">
                      {calculatePercentage(
                        expense.amount
                      )}
                      %
                    </div>

                    <button
                      onClick={() =>
                        removeExpense(
                          "variable",
                          expense.id
                        )
                      }
                      className="rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}