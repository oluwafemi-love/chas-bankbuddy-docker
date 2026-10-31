import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { mockGetUser, mockDeleteUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockDeleteUser: vi.fn(),
}));

vi.mock("../models/users.js", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getUser: mockGetUser,
    deleteUser: mockDeleteUser,
  };
});

import app from "../server.js";

describe("DELETE /users", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      id: 5,
      username: "test-user",
    });

    mockDeleteUser.mockResolvedValue({
      affectedRows: 1,
    });
  });

  it("prevents deleting a user with transaction history", async () => {
    const foreignKeyError = new Error("Foreign key constraint fails");
    foreignKeyError.code = "ER_ROW_IS_REFERENCED_2";
    foreignKeyError.errno = 1451;

    mockDeleteUser.mockRejectedValue(foreignKeyError);

    const response = await request(app)
      .delete("/users")
      .send({
        username: "test-user",
      });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message:
        "This account has transaction history and cannot be deleted.",
    });

    expect(mockGetUser).toHaveBeenCalledWith("test-user");
    expect(mockDeleteUser).toHaveBeenCalledWith(5);
  });

  it("successfully deletes a user without transaction history", async () => {
    const response = await request(app)
      .delete("/users")
      .send({
        username: "test-user",
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "User deleted successfully.",
    });

    expect(mockGetUser).toHaveBeenCalledWith("test-user");
    expect(mockDeleteUser).toHaveBeenCalledWith(5);
  });

  it("rejects requests without a username", async () => {
    const response = await request(app)
      .delete("/users")
      .send({});

    expect(response.status).toBe(400);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it("returns 404 when the user does not exist", async () => {
    mockGetUser.mockResolvedValue(null);

    const response = await request(app)
      .delete("/users")
      .send({
        username: "unknown-user",
      });

    expect(response.status).toBe(404);
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});