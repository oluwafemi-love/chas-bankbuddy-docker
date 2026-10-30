
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../server.js";

describe("JSON request body handling", () => {
  it("accepts JSON requests within the 100kb limit", async () => {
    const response = await request(app)
      .post("/nonexistent-test-route")
      .send({
        message: "Small JSON payload",
      });

    expect(response.status).toBe(404);
  });

  it("returns JSON when the request body exceeds 100kb", async () => {
    const largePayload = {
      message: "x".repeat(110 * 1024),
    };

    const response = await request(app)
      .post("/nonexistent-test-route")
      .send(largePayload);

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      message: "Request body exceeds the maximum allowed size of 100kb.",
    });
  });

  it("returns JSON when the request body contains malformed JSON", async () => {
    const response = await request(app)
      .post("/nonexistent-test-route")
      .set("Content-Type", "application/json")
      .send('{"message":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid JSON request body.",
    });
  });
});
