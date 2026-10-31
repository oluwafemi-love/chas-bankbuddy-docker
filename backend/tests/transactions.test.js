import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const {
  mockGetSessionByToken,
  mockDepositToAccount,
  mockGetTransactionsByUserId,
} = vi.hoisted(() => ({
  mockGetSessionByToken: vi.fn(),
  mockDepositToAccount: vi.fn(),
  mockGetTransactionsByUserId: vi.fn(),
}));

vi.mock("../models/sessions.js", () => ({
  createSession: vi.fn(),
  getSessionByToken: mockGetSessionByToken,
}));

vi.mock("../models/accounts.js", () => ({
  createAccount: vi.fn(),
  getAccountByUserId: vi.fn(),
  depositToAccount: mockDepositToAccount,
  getTransactionsByUserId: mockGetTransactionsByUserId,
}));

import app from "../server.js";

describe("Account transactions API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSessionByToken.mockResolvedValue({
      user_id: 5,
    });

    mockDepositToAccount.mockResolvedValue({
      accountId: 5,
      amount: 1100,
    });

    mockGetTransactionsByUserId.mockResolvedValue([]);
  });

  describe("POST /me/accounts/transactions", () => {
    it("successfully deposits money", async () => {
      const response = await request(app)
        .post("/me/accounts/transactions")
        .send({
          token: "valid-token",
          amount: 200,
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        amount: 1100,
        message: "Deposit successful",
      });

      expect(mockDepositToAccount).toHaveBeenCalledWith(5, 200);
    });

    it("rejects requests without a token", async () => {
      const response = await request(app)
        .post("/me/accounts/transactions")
        .send({
          amount: 200,
        });

      expect(response.status).toBe(400);
      expect(mockDepositToAccount).not.toHaveBeenCalled();
    });

    it("rejects invalid session tokens", async () => {
      mockGetSessionByToken.mockResolvedValue(null);

      const response = await request(app)
        .post("/me/accounts/transactions")
        .send({
          token: "invalid-token",
          amount: 200,
        });

      expect(response.status).toBe(401);
      expect(mockDepositToAccount).not.toHaveBeenCalled();
    });

    it.each([0, -100, 1.5, "200", null])(
      "rejects an invalid deposit amount: %j",
      async (amount) => {
        const response = await request(app)
          .post("/me/accounts/transactions")
          .send({
            token: "valid-token",
            amount,
          });

        expect(response.status).toBe(400);
        expect(mockDepositToAccount).not.toHaveBeenCalled();
      },
    );
  });

  describe("POST /me/accounts/transactions/history", () => {
    it("returns transaction history for the authenticated user", async () => {
      const transactions = [
        {
          id: 1,
          type: "deposit",
          amount: 200,
          status: "completed",
          created_at: "2026-10-30T10:00:00.000Z",
        },
      ];

      mockGetTransactionsByUserId.mockResolvedValue(transactions);

      const response = await request(app)
        .post("/me/accounts/transactions/history")
        .send({
          token: "valid-token",
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        transactions,
      });

      expect(mockGetTransactionsByUserId).toHaveBeenCalledWith(5);
    });

    it("rejects requests without a token", async () => {
      const response = await request(app)
        .post("/me/accounts/transactions/history")
        .send({});

      expect(response.status).toBe(400);
      expect(mockGetTransactionsByUserId).not.toHaveBeenCalled();
    });

    it("rejects invalid session tokens", async () => {
      mockGetSessionByToken.mockResolvedValue(null);

      const response = await request(app)
        .post("/me/accounts/transactions/history")
        .send({
          token: "invalid-token",
        });

      expect(response.status).toBe(401);
      expect(mockGetTransactionsByUserId).not.toHaveBeenCalled();
    });

    it("returns an empty array when the user has no transactions", async () => {
      mockGetTransactionsByUserId.mockResolvedValue([]);

      const response = await request(app)
        .post("/me/accounts/transactions/history")
        .send({
          token: "valid-token",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        transactions: [],
      });
    });

    it("uses the authenticated user's ID rather than a client-supplied user ID", async () => {
      mockGetSessionByToken.mockResolvedValue({
        user_id: 8,
      });

      const response = await request(app)
        .post("/me/accounts/transactions/history")
        .send({
          token: "valid-token",
          userId: 5,
        });

      expect(response.status).toBe(200);
      expect(mockGetTransactionsByUserId).toHaveBeenCalledWith(8);
    });
  });
});
