"use client";

import React from "react";
import { getAccount, depositMoney } from "@/app/lib/client";

export default function BalancePage() {
  const [balance, setBalance] = React.useState<number | null>(null);
  const [amount, setAmount] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [depositing, setDepositing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  React.useEffect(() => {
    async function loadAccount() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your account.");
        setLoading(false);
        return;
      }

      try {
        const account = await getAccount(token);
        setBalance(account.amount);
      } catch (error) {
        console.error("Failed to load account:", error);
        setError("Unable to load your account balance.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  async function handleDeposit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = sessionStorage.getItem("token");
    const depositAmount = Number(amount);

    if (!token) {
      setError("Please log in before making a deposit.");
      return;
    }

    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    setDepositing(true);

    try {
      const response = await depositMoney({
        token,
        amount: depositAmount,
      });

      setBalance(response.amount);
      setAmount("");
      setSuccess("Your deposit was successful.");
    } catch (error) {
      console.error("Deposit failed:", error);
      setError("Unable to complete your deposit. Please try again.");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Balance
        </h1>

        <p className="mt-2 text-foreground">
          View and manage your available funds.
        </p>
      </header>

      {/* Balance card */}
      <section className="rounded-2xl bg-background p-6 shadow-2xs sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available Balance
        </p>

        <p className="mt-3 text-4xl font-bold text-success">
          {loading
            ? "Loading..."
            : balance === null
              ? "Unavailable"
              : `${balance.toLocaleString()} kr`}
        </p>
      </section>

      {/* Deposit form */}
      <section className="rounded-2xl border border-slate-200 bg-background p-6 shadow-2xs sm:p-8">
        <h2 className="text-xl font-bold text-foreground">
          Deposit Money
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Add funds to your account.
        </p>

        <form onSubmit={handleDeposit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-sm font-medium text-muted-foreground"
            >
              Deposit Amount (kr)
            </label>

            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-emerald-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || depositing || balance === null}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {depositing ? "Processing..." : "Deposit Money"}
          </button>
        </form>
      </section>
    </div>
  );
}