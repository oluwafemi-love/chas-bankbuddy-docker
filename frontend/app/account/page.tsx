"use client";

import React from "react";
import {
  getAccount,
  depositMoney,
  getFeatureFlags,
} from "@/app/lib/client";

export default function AccountPage() {
  const [balance, setBalance] = React.useState(0);
  const [amount, setAmount] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [newDashboardEnabled, setNewDashboardEnabled] =
    React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function loadFeatureFlags() {
      try {
        const flags = await getFeatureFlags();

        if (active) {
          setNewDashboardEnabled(flags.newDashboard);
        }
      } catch (error) {
        // Fail closed: keep the feature hidden if flags cannot load.
        console.error("Failed to load feature flags:", error);
      }
    }

    loadFeatureFlags();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    async function loadAccount() {
      const token = sessionStorage.getItem("token");
      const storedUsername = sessionStorage.getItem("username");

      if (storedUsername) {
        setUsername(storedUsername);
      }

      if (!token) {
        console.error("No login token found");
        return;
      }

      try {
        const account = await getAccount(token);

        // console.log("ACCOUNT RESPONSE:", account);

        setBalance(account.amount);
      } catch (error) {
        console.error("Failed to load account:", error);
      }
    }

    loadAccount();
  }, []);

  async function handleDeposit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("No login token found");
      return;
    }

    const depositAmount = Number(amount);

    try {
      const response = await depositMoney({
        token,
        amount: depositAmount,
      });

      // console.log("TRANSACTION RESPONSE:", response);

      setBalance(response.amount);
      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold tracking-tight text-gray-50 sm:text-2xl capitalize">
        Welcome {username}
      </h2>
      <div className="mx-auto my-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        {/* Header & Balance Card */}

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Account Overview
          </h1>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available Balance
            </p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-600">
              {balance.toLocaleString()}{" "}
              <span className="text-lg font-medium text-slate-600">
                kr
              </span>
            </p>
          </div>
        </div>

        <hr className="my-6 border-slate-200" />

        {/* Deposit Form */}
        <form onSubmit={handleDeposit} className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Deposit Money
          </h2>

          <div className="space-y-1.5">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700"
            >
              Amount (kr)
            </label>
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:opacity-50"
          >
            Deposit
          </button>
        </form>
      </div>
      {newDashboardEnabled && (
        <section
          aria-labelledby="savings-panel-title"
          className="mx-auto mb-8 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            New feature
          </p>

          <h2
            id="savings-panel-title"
            className="mt-2 text-xl font-bold text-slate-900"
          >
            Savings spotlight
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Small, consistent steps can help you build better saving
            habits. Consider setting a savings goal and reviewing your
            progress regularly.
          </p>
        </section>
      )}
    </div>
  );
}
