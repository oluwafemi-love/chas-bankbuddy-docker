
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetConnection,
  mockBeginTransaction,
  mockExecute,
  mockCommit,
  mockRollback,
  mockRelease,
} = vi.hoisted(() => ({
  mockGetConnection: vi.fn(),
  mockBeginTransaction: vi.fn(),
  mockExecute: vi.fn(),
  mockCommit: vi.fn(),
  mockRollback: vi.fn(),
  mockRelease: vi.fn(),
}));

vi.mock("../lib/utils.js", () => ({
  query: vi.fn(),
  pool: {
    getConnection: mockGetConnection,
  },
}));

import { depositToAccount } from "../models/accounts.js";

const MAX_BALANCE = 2147483647;

describe("depositToAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetConnection.mockResolvedValue({
      beginTransaction: mockBeginTransaction,
      execute: mockExecute,
      commit: mockCommit,
      rollback: mockRollback,
      release: mockRelease,
    });

    mockBeginTransaction.mockResolvedValue(undefined);
    mockCommit.mockResolvedValue(undefined);
    mockRollback.mockResolvedValue(undefined);
    mockRelease.mockReturnValue(undefined);
  });

  it("updates the balance and records a deposit in one transaction", async () => {
    mockExecute
      .mockResolvedValueOnce([
        [{ id: 5, balance: 900 }],
        [],
      ])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([{ insertId: 1 }, []]);

    const result = await depositToAccount(5, 200);

    expect(result).toEqual({
      accountId: 5,
      amount: 1100,
    });

    expect(mockBeginTransaction).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(mockCommit).toHaveBeenCalledOnce();
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("allows a deposit that reaches the maximum balance exactly", async () => {
    const currentBalance = MAX_BALANCE - 100;
    const depositAmount = 100;

    mockExecute.mockResolvedValueOnce([
      [{ id: 5, balance: currentBalance }],
      [],
    ]);

    mockExecute
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockResolvedValueOnce([{ insertId: 2 }, []]);

    const result = await depositToAccount(5, depositAmount);

    expect(result).toEqual({
      accountId: 5,
      amount: MAX_BALANCE,
    });

    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(mockCommit).toHaveBeenCalledOnce();
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("rejects a deposit that would exceed the maximum balance", async () => {
    const currentBalance = MAX_BALANCE - 100;
    const depositAmount = 101;

    mockExecute.mockResolvedValueOnce([
      [{ id: 5, balance: currentBalance }],
      [],
    ]);

    await expect(
      depositToAccount(5, depositAmount),
    ).rejects.toThrow("Account balance limit exceeded");

    // Only the account lookup should execute.
    expect(mockExecute).toHaveBeenCalledOnce();

    // The balance update and transaction insert must never happen.
    expect(mockCommit).not.toHaveBeenCalled();

    // The transaction must be rolled back.
    expect(mockRollback).toHaveBeenCalledOnce();

    // The connection must always be released.
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("rolls back the balance update if recording the deposit fails", async () => {
    mockExecute
      .mockResolvedValueOnce([
        [{ id: 5, balance: 900 }],
        [],
      ])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
      .mockRejectedValueOnce(new Error("Transaction insert failed"));

    await expect(
      depositToAccount(5, 200),
    ).rejects.toThrow("Transaction insert failed");

    expect(mockBeginTransaction).toHaveBeenCalledOnce();
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRollback).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("releases the connection when the account does not exist", async () => {
    mockExecute.mockResolvedValueOnce([[], []]);

    await expect(
      depositToAccount(999, 200),
    ).rejects.toThrow("Account not found");

    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRollback).toHaveBeenCalledOnce();
    expect(mockRelease).toHaveBeenCalledOnce();
  });
});
