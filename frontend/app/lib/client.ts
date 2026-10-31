const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  AccountResponse,
  TransactionRequest,
  TransactionResponse,
} from "@/app/types/shared";

export interface TransactionHistoryItem {
  id: number;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
}

export async function createUser(request: CreateUserRequest) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  return res.json();
}

export async function loginUser(
  request: LoginRequest,
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  return res.json();
}

export async function getAccount(
  token: string,
): Promise<AccountResponse> {
  const res = await fetch(`${API_URL}/me/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error("Failed to get account");
  }

  return res.json();
}

export async function depositMoney(
  request: TransactionRequest,
): Promise<TransactionResponse> {
  const res = await fetch(`${API_URL}/me/accounts/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to deposit money");
  }

  return res.json();
}

export async function getTransactions(
  token: string,
): Promise<TransactionHistoryResponse> {
  const res = await fetch(`${API_URL}/me/accounts/transactions/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error("Failed to retrieve transaction history");
  }

  return res.json();
}

export async function getFeatureFlags(): Promise<{
  newDashboard: boolean;
}> {
  const res = await fetch(`${API_URL}/feature-flags`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch feature flags");
  }

  return res.json();
}