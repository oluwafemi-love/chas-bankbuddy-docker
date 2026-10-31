"use client";

import React from "react";
import {
  getTransactions,
  type TransactionHistoryItem,
} from "@/app/lib/client";

export default function AccountHistoryPage() {
  const [transactions, setTransactions] = React.useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function loadTransactions() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your transaction history.");
        setLoading(false);
        return;
      }

      try {
        const response = await getTransactions(token);
        setTransactions(response.transactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
        setError(
          "We couldn't load your transaction history. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  function formatAmount(amount: number) {
    return `${amount.toLocaleString("en-US")} kr`;
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  }

  function formatTransactionType(type: string) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-medium text-indigo-600">
          YOUR ACCOUNT
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Account History
        </h1>

        <p className="mt-2 text-slate-600">
          Review your deposits and other banking activities.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transactions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your most recent account activity
            </p>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {transactions.length}{" "}
              {transactions.length === 1
                ? "transaction"
                : "transactions"}
            </span>
          )}
        </div>

        {loading ? (
          <div
            className="p-10 text-center text-slate-500"
            role="status"
            aria-live="polite"
          >
            Loading your transactions...
          </div>
        ) : error ? (
          <div className="p-10 text-center" role="alert">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <span className="text-xl" aria-hidden="true">
                ↗
              </span>
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No transactions yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your deposits and other account activities will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <span className="text-lg" aria-hidden="true">
                      {transaction.type === "deposit" ? "↓" : "↗"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {formatTransactionType(transaction.type)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                  <p className="font-semibold text-slate-900">
                    {transaction.type === "deposit" ? "+" : "-"}
                    {formatAmount(transaction.amount)}
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      transaction.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : transaction.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {formatTransactionType(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
