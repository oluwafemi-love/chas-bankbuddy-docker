"use client";

import React from "react";
import Link from "next/link";
import { getAccount, getFeatureFlags } from "@/app/lib/client";

export default function AccountPage() {
  const [balance, setBalance] = React.useState<number | null>(null);
  const [username, setUsername] = React.useState("");
  const [showSavingsSpotlight, setShowSavingsSpotlight] =
    React.useState(false);

  React.useEffect(() => {
    async function loadDashboard() {
      const token = sessionStorage.getItem("token");
      const storedUsername = sessionStorage.getItem("username");

      if (storedUsername) {
        setUsername(storedUsername);
      }

      // Load the feature flag independently of account authentication.
      try {
        const flags = await getFeatureFlags();
        setShowSavingsSpotlight(flags.newDashboard);
      } catch (error) {
        console.error("Failed to load feature flags:", error);
        setShowSavingsSpotlight(false);
      }

      if (!token) return;

      try {
        const account = await getAccount(token);
        setBalance(account.amount);
      } catch (error) {
        console.error("Failed to load account:", error);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-medium text-indigo-600">
          BANKBUDDY DASHBOARD
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Welcome{username ? `, ${username}` : ""}
        </h1>

        <p className="mt-2 text-slate-600">
          Here&apos;s an overview of your banking activity.
        </p>
      </header>

      {showSavingsSpotlight && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <p className="text-sm font-semibold text-indigo-600">
            FEATURED
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Savings spotlight
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Explore your savings options and keep track of your financial goals.
          </p>

          <Link
            href="/account/savings"
            className="mt-4 inline-block rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Explore Savings
          </Link>
        </section>
      )}

      {/* Balance summary */}
      <section className="rounded-2xl bg-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-indigo-100">
          Available Balance
        </p>

        <p className="mt-3 text-3xl font-bold sm:text-4xl">
          {balance === null
            ? "Loading..."
            : `${balance.toLocaleString()} kr`}
        </p>

        <Link
          href="/account/balance"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Manage Balance
        </Link>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Quick Access
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/account/balance"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">
              Account Balance
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              View your balance and deposit money.
            </p>
          </Link>

          <Link
            href="/account/history"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">
              Account History
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Review your account transactions.
            </p>
          </Link>

          <Link
            href="/account/notifications"
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">
              Notifications
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              View your account updates.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}